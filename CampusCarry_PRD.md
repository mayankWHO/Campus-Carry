# Product Requirements Document
## CampusCarry — Peer Errand Coordination for College Students

**Version:** 1.0  
**Date:** May 2026  
**Status:** Ready for Development  
**Target:** Hackathon MVP

---

## 1. Product Overview

### 1.1 Problem Statement

College hostel students frequently need everyday essentials from outside campus (groceries, medicine, stationery, electronics). Travelling to the city for small purchases is economically unviable for individual students. Meanwhile, other students make these trips regularly but are unaware of peers who need items brought back. Current workarounds (WhatsApp groups, notice boards) are unstructured, unreliable, and have no accountability layer.

### 1.2 Solution

CampusCarry is a web application that connects college students going out on trips with students who need items brought back. Students who are going out ("Goers") post their trip details and capacity. Students who need items ("Requesters") discover these posts and coordinate with Goers to get their items. A 50% advance payment mechanism ensures commitment from both sides.

### 1.3 Target Users

- **Primary:** Residential college students in India
- **Secondary:** College hostels and PGs near campus
- **Geography:** India only (Phase 1)

### 1.4 Core Value Proposition

> "The missing coordination layer for college hostels. Structured, verified, and campus-native."

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS |
| Backend + Database | Convex |
| Authentication | Convex Auth |
| Student Verification | SheerID embedded widget |
| Real-time Chat | Convex live queries (built-in) |
| Email Notifications | Resend |
| Hosting | Vercel |
| Payment (Stub) | Razorpay payment link / UPI deeplink |

### 2.1 Key Architectural Notes

- Use **Server Components** for feed pages, trip detail pages, and static UI
- Use **Client Components** (with `"use client"`) for anything using Convex subscriptions — chat, live feed updates, comment interactions
- Convex handles real-time via live queries — `useQuery` hooks auto re-render on data changes, no manual WebSocket management needed
- `chatId` is generated deterministically: `${tripId}_${requesterId}`
- All email triggers go through Resend with templated emails

---

## 3. User Roles

### Goer
A student who is going outside campus and is willing to carry items for others.

### Requester
A student who needs items from outside campus and wants to coordinate with a Goer.

> Note: These are not fixed roles. Any verified user can be a Goer on one day and a Requester on another.

---

## 4. Authentication & Verification Flow

### 4.1 Sign Up
1. User visits `/signup`
2. Enters name, personal email (Gmail, Outlook, etc. — any email is allowed), and password
3. Account is created in Convex with status: `pending_verification`
4. User is redirected to `/verify` — the SheerID verification page

### 4.2 SheerID Student Verification
1. SheerID embedded widget is rendered on `/verify`
2. User completes SheerID's student verification flow (institution lookup, document upload if needed)
3. On SheerID verification success → webhook fires to Convex backend
4. Convex updates user status to `verified`
5. User is redirected to `/feed`

### 4.3 Access Control
- `pending_verification` users: Can browse the feed (read-only). Cannot post trips, cannot comment, cannot chat.
- `verified` users: Full access to all features.
- Unverified users attempting restricted actions see an inline prompt to complete verification.

### 4.4 Login
- Standard email + password login via Convex Auth
- Redirect to `/feed` on success

---

## 5. Pages & Routes

### 5.1 Route Structure

```
/                        → Landing page (marketing)
/signup                  → Sign up form
/login                   → Login form
/verify                  → SheerID verification widget
/feed                    → Main feed (trip posts + request board)
/trip/new                → Create a new trip post
/trip/[tripId]           → Trip detail page + comments
/requests                → Reverse request board
/request/new             → Post a new item request
/chat/[chatId]           → 1:1 chat between Goer and Requester
/profile/[userId]        → User profile + rating history
/notifications           → Email notification preferences
```

### 5.2 Page Details

#### `/` — Landing Page
- Hero section: Problem statement + CTA ("Join your campus")
- How it works: 3-step visual (Post → Match → Deliver)
- Trust signals: Verified students only, rating system, payment protection
- CTA: Sign up / Log in

#### `/feed` — Main Feed
- **Default view:** Trip posts sorted by soonest departure date
- **Toggle:** Switch between "Trips" feed and "Requests" board
- **Filters:** Destination category (Grocery, Pharmacy, Electronics, Food, Other), Date range
- Each trip card shows: Goer name + rating, destination, date/time, slots available, item size limit
- Floating "Post a Trip" button (bottom right)
- Floating "Request an Item" button (secondary)

#### `/trip/new` — Create Trip Post
Fields:
- Destination name (text)
- Destination category (dropdown: Grocery, Pharmacy, Electronics, Food, Other)
- Date of trip (date picker)
- Approximate departure time
- Number of people I can carry for (1 / 2 / 3+)
- Max item size (Small — fits in a bag / Medium — shoebox size / Large — bigger)
- Notes (optional free text)
- Payment expectation (toggle: "Requester pays 50% advance via UPI")

#### `/trip/[tripId]` — Trip Detail
- Full trip details
- Goer profile card with rating
- Comment section: Requesters post what they need
- Each comment shows: Item description, quantity, requester name
- Goer can click "Accept Request" on a comment → triggers chat unlock + email notification
- Accepted requests show a "Matched" badge
- Slots remaining counter updates as requests are accepted

#### `/requests` — Reverse Request Board
- Requesters post what they need without waiting for a Goer to post
- Cards show: Item needed, requester name + rating, urgency (flexible / this week / urgent)
- Goers can click "I can get this" → triggers chat unlock + email notification

#### `/request/new` — Post Item Request
Fields:
- Item name + description
- Preferred destination/store (optional)
- Urgency (Flexible / This week / Urgent)
- Max budget for the item (optional, for Goer's reference)
- Notes

#### `/chat/[chatId]` — Chat Page
- Real-time 1:1 chat between matched Goer and Requester
- Chat is unlocked only after a match is made
- Payment stub section at top: "Send 50% advance (₹[amount]) via UPI" → deeplinks to GPay/PhonePe
- "Mark as Paid" button for Requester → updates chat status
- Goer sees "Mark as Delivered" button after trip date
- Requester sees "Confirm Delivery" button → triggers rating flow
- Both parties can rate each other after delivery confirmation (1–5 stars + optional text)

#### `/profile/[userId]` — Profile Page
- Name, college (from SheerID), member since
- Rating (average stars + number of trips completed)
- Trip history (as Goer and as Requester)
- Badges: "Reliable Goer", "5 Trips Completed", etc. (future scope — define schema now)

---

## 6. Convex Database Schema

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  users: defineTable({
    name: v.string(),
    email: v.string(),
    college: v.optional(v.string()),         // populated by SheerID on verification
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("verified")
    ),
    sheerIdVerificationId: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalTripsAsGoer: v.number(),
    totalTripsAsRequester: v.number(),
    createdAt: v.number(),
  }),

  trips: defineTable({
    goerId: v.id("users"),
    destination: v.string(),
    destinationCategory: v.union(
      v.literal("grocery"),
      v.literal("pharmacy"),
      v.literal("electronics"),
      v.literal("food"),
      v.literal("other")
    ),
    tripDate: v.string(),                    // ISO date string
    departureTime: v.string(),               // e.g. "10:00 AM"
    slotsAvailable: v.number(),              // 1, 2, or 3
    slotsRemaining: v.number(),              // decrements on match
    maxItemSize: v.union(
      v.literal("small"),
      v.literal("medium"),
      v.literal("large")
    ),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("full"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  }),

  comments: defineTable({
    tripId: v.id("trips"),
    requesterId: v.id("users"),
    itemDescription: v.string(),
    quantity: v.optional(v.string()),
    estimatedAmount: v.optional(v.number()),  // in INR
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  }),

  itemRequests: defineTable({               // reverse request board
    requesterId: v.id("users"),
    itemName: v.string(),
    itemDescription: v.string(),
    preferredDestination: v.optional(v.string()),
    urgency: v.union(
      v.literal("flexible"),
      v.literal("this_week"),
      v.literal("urgent")
    ),
    maxBudget: v.optional(v.number()),
    status: v.union(
      v.literal("open"),
      v.literal("matched"),
      v.literal("fulfilled"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  }),

  chats: defineTable({
    chatId: v.string(),                      // `${tripId}_${requesterId}`
    tripId: v.id("trips"),
    commentId: v.id("comments"),
    goerId: v.id("users"),
    requesterId: v.id("users"),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("advance_paid"),
      v.literal("fully_paid")
    ),
    deliveryStatus: v.union(
      v.literal("pending"),
      v.literal("delivered"),
      v.literal("confirmed")
    ),
    createdAt: v.number(),
  }),

  messages: defineTable({
    chatId: v.string(),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_chatId", ["chatId"]),         // index for efficient querying

  ratings: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),
    chatId: v.string(),
    stars: v.number(),                       // 1-5
    comment: v.optional(v.string()),
    role: v.union(
      v.literal("goer"),                     // rating given to the goer
      v.literal("requester")                 // rating given to the requester
    ),
    createdAt: v.number(),
  }),

});
```

---

## 7. Convex Functions

### 7.1 Queries

```typescript
// Get all open trips (feed)
getTrips(filters?: { category?, dateFrom?, dateTo? }) → Trip[]

// Get single trip with goer details
getTrip(tripId) → Trip & { goer: User }

// Get comments for a trip
getComments(tripId) → Comment[] & { requester: User }[]

// Get all open item requests
getItemRequests(filters?: { urgency? }) → ItemRequest[]

// Get messages for a chat (live query — auto re-renders on new messages)
getMessages(chatId) → Message[]

// Get chat details
getChat(chatId) → Chat & { goer: User, requester: User }

// Get user profile
getUser(userId) → User & { ratings: Rating[] }
```

### 7.2 Mutations

```typescript
// Create a new trip post
createTrip(destination, category, tripDate, departureTime, slots, maxItemSize, notes?)

// Post a comment on a trip
createComment(tripId, itemDescription, quantity?, estimatedAmount?)

// Goer accepts a comment → creates chat, updates slots
acceptComment(commentId) → chatId

// Post a reverse item request
createItemRequest(itemName, description, preferredDestination?, urgency, maxBudget?)

// Send a chat message
sendMessage(chatId, content)

// Update payment status
markAdvancePaid(chatId)

// Goer marks delivered
markDelivered(chatId)

// Requester confirms delivery
confirmDelivery(chatId)

// Submit rating
submitRating(chatId, toUserId, stars, comment?, role)
```

---

## 8. Chat

### 8.1 User Experience

The chat is a standard real-time messaging interface — identical to WhatsApp Web from the user's perspective:

- Text input fixed at the bottom
- Messages appear instantly as they are sent — no page refresh
- Both users see the conversation update live
- Timestamps shown on each message
- Sender's messages appear on the right, receiver's on the left

The only difference from a generic chat is a **status banner pinned at the top** of the chat window showing payment and delivery state (see Section 10).

### 8.2 Chat UI Layout

```
┌─────────────────────────────────────┐
│  [Payment / Delivery Status Banner] │  ← pinned at top
├─────────────────────────────────────┤
│                                     │
│   Priya: Can you get 2 Maggi        │
│   packets and a USB-C charger?      │
│                                     │
│              Sure! What's your UPI? │
│                                     │
│   Priya: priya@okaxis               │
│                                     │
├─────────────────────────────────────┤
│  [Type a message...]        [Send]  │  ← fixed at bottom
└─────────────────────────────────────┘
```

### 8.3 Implementation

Chat uses Convex's `useQuery` and `useMutation` hooks — the standard pattern for any real-time feature in Convex. `getMessages` is a live query that auto-rerenders the component when new messages arrive; `sendMessage` is a mutation that writes to the messages table.

```typescript
// convex/messages.ts

export const getMessages = query({
  args: { chatId: v.string() },
  handler: async (ctx, { chatId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chatId", q => q.eq("chatId", chatId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    chatId: v.string(),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
```

```typescript
// components/Chat.tsx
"use client"

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Chat({ chatId, currentUserId }: { chatId: string, currentUserId: string }) {
  const [input, setInput] = useState("");
  const messages = useQuery(api.messages.getMessages, { chatId });
  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage({ chatId, senderId: currentUserId, content: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Status banner goes here — see Section 10 */}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages?.map(msg => (
          <div
            key={msg._id}
            className={msg.senderId === currentUserId ? "text-right" : "text-left"}
          >
            <span className="inline-block bg-gray-100 rounded-lg px-3 py-2">
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-4 border-t">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
}
```

---

## 9. Email Notifications

### 9.1 Provider
**Resend** — `npm install resend`

### 9.2 Triggers

| Event | Recipient | Subject |
|---|---|---|
| Someone comments on your trip | Goer | "Someone wants to join your trip to [destination]" |
| Goer accepts your request | Requester | "Your request was accepted — pay advance to confirm" |
| New message (user inactive 5+ mins) | Inactive party | "New message from [name] on CampusCarry" |
| Goer marks delivered | Requester | "Your items are delivered — confirm and rate [name]" |
| Delivery confirmed | Goer | "Delivery confirmed — rate [requester name]" |

### 9.3 Implementation Pattern

```typescript
// convex/notifications.ts (called from mutations via Convex actions)

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail(
  to: string,
  subject: string,
  body: string
) {
  await resend.emails.send({
    from: "CampusCarry <notify@campuscarry.in>",
    to,
    subject,
    html: body,
  });
}
```

---

## 10. Payment Flow (Stub for MVP)

### 10.1 Flow
1. After chat is unlocked, Requester sees a payment banner at the top of chat
2. "Pay ₹[amount] advance" button → deeplinks to GPay/PhonePe with pre-filled UPI ID and amount
3. UPI ID is the Goer's UPI (collected optionally on profile setup)
4. Requester clicks "Mark as Paid" in app → chat status updates to `advance_paid`
5. After delivery, Requester pays remaining 50% outside app → Goer marks "fully paid" manually or it's assumed on delivery confirmation

### 10.2 UPI Deeplink Format
```
upi://pay?pa=[goer_upi_id]&pn=[goer_name]&am=[amount]&cu=INR&tn=CampusCarry+Advance
```

### 10.3 Future Scope (Post-hackathon)
- Razorpay escrow integration
- In-app wallet
- Automated release on delivery confirmation
- Dispute resolution flow

---

## 11. User Stories

### Goer Stories
- As a Goer, I can post a trip with destination, date, capacity, and size limits so Requesters can find me
- As a Goer, I can see all comments on my trip and choose which requests to accept
- As a Goer, I can chat with accepted Requesters to clarify item details
- As a Goer, I can mark a delivery as complete and rate the Requester

### Requester Stories
- As a Requester, I can browse the feed to find Goers heading to destinations I need
- As a Requester, I can comment on a trip with what I need
- As a Requester, I can post a reverse request if no active trips match my needs
- As a Requester, I can chat with the Goer once matched
- As a Requester, I can pay 50% advance via UPI deeplink and mark it in the app
- As a Requester, I can confirm delivery and rate the Goer

### Trust & Safety Stories
- As a user, I must verify my student status via SheerID before posting or requesting
- As a user, I can see a Goer's or Requester's rating before choosing to match
- As a user, I am notified by email at every key step of the coordination flow

---

## 12. Non-Functional Requirements

- **Performance:** Feed page loads in under 2 seconds. Chat messages appear in under 500ms.
- **Responsiveness:** Fully responsive — works on mobile browsers (students will primarily use phones)
- **Security:** All Convex queries must validate that the requesting user is authenticated and has access to the requested resource (e.g. only chat participants can read messages)
- **Scalability:** Schema and architecture designed to support multiple colleges — college field on user enables filtering by campus in future

---

## 13. Out of Scope (MVP)

The following are explicitly excluded from the hackathon build. Mention them in the pitch as future roadmap:

- In-app escrow / Razorpay integration (real money handling)
- Dispute resolution system
- Admin panel / moderation dashboard
- Multi-college feed (single college for MVP demo)
- Native mobile app
- Group trip coordination (multiple Goers merging)
- Item photo uploads
- Push notifications

---

## 14. Demo Flow (For Hackathon Presentation)

Use two browser windows (or two devices) to show:

1. **Rohan** (Goer) logs in → verified student badge visible
2. Rohan posts: "Going to D-Mart, Saturday 10am, can carry for 2, medium items"
3. **Priya** (Requester) sees the post on the feed → clicks into it
4. Priya comments: "Can you get me Maggi (2 packets) and a USB-C charger?"
5. Rohan sees the email notification → opens the app → accepts Priya's request
6. Chat unlocks → Priya sees the payment banner → clicks "Pay ₹150 advance" → UPI deeplinks
7. Priya clicks "Mark as Paid" → chat status updates live
8. After the trip, Rohan clicks "Mark as Delivered"
9. Priya sees the email → confirms delivery → rating screen appears
10. Both rate each other → ratings update on profiles

**Total demo runtime: ~90 seconds**

---

## 15. Pitch Narrative

> "Every weekend, thousands of college students make trips to the city. And thousands more need things brought back but can't justify the travel cost. CampusCarry is the structured, verified coordination layer that connects them — built for Indian college hostels, starting with one campus and designed to scale to 1000+. WhatsApp groups are noisy. Notice boards are dead. CampusCarry is campus-native, student-verified, and built on trust."

**TAM:** 1000+ residential colleges in India × average 2000 students = 2M+ potential users in Phase 1 alone.

---

*End of PRD v1.0*
