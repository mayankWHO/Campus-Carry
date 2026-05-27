import { mutation } from "./_generated/server";

// Seeder to populate the database with mock hackathon demo data
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Clean existing data to avoid duplicates (optional, but good for demo reload)
    const existingUsers = await ctx.db.query("users").collect();
    for (const u of existingUsers) {
      await ctx.db.delete(u._id);
    }
    const existingTrips = await ctx.db.query("trips").collect();
    for (const t of existingTrips) {
      await ctx.db.delete(t._id);
    }
    const existingComments = await ctx.db.query("comments").collect();
    for (const c of existingComments) {
      await ctx.db.delete(c._id);
    }
    const existingRequests = await ctx.db.query("itemRequests").collect();
    for (const r of existingRequests) {
      await ctx.db.delete(r._id);
    }
    const existingChats = await ctx.db.query("chats").collect();
    for (const ch of existingChats) {
      await ctx.db.delete(ch._id);
    }
    const existingMessages = await ctx.db.query("messages").collect();
    for (const m of existingMessages) {
      await ctx.db.delete(m._id);
    }
    const existingRatings = await ctx.db.query("ratings").collect();
    for (const rt of existingRatings) {
      await ctx.db.delete(rt._id);
    }

    // 2. Create Rohan (Goer)
    const rohanId = await ctx.db.insert("users", {
      name: "Rohan Sharma",
      email: "rohan@hostel.edu",
      college: "Indian Institute of Technology (IIT), Delhi",
      verificationStatus: "verified",
      upiId: "rohan@okaxis",
      averageRating: 4.9,
      totalTripsAsGoer: 4,
      totalTripsAsRequester: 1,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });

    // 3. Create Priya (Requester)
    const priyaId = await ctx.db.insert("users", {
      name: "Priya Patel",
      email: "priya@hostel.edu",
      college: "Indian Institute of Technology (IIT), Delhi",
      verificationStatus: "verified",
      upiId: "priya@paytm",
      averageRating: 4.8,
      totalTripsAsGoer: 1,
      totalTripsAsRequester: 6,
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    });

    // 4. Create Amit (Another student)
    const amitId = await ctx.db.insert("users", {
      name: "Amit Verma",
      email: "amit@hostel.edu",
      college: "Indian Institute of Technology (IIT), Delhi",
      verificationStatus: "verified",
      upiId: "amit@okhdfc",
      averageRating: 4.5,
      totalTripsAsGoer: 0,
      totalTripsAsRequester: 2,
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    });

    // 5. Create Rohan's upcoming trip
    const tripId = await ctx.db.insert("trips", {
      goerId: rohanId,
      destination: "D-Mart Supermarket, Outer Ring Rd",
      destinationCategory: "grocery",
      tripDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
      departureTime: "10:00 AM",
      slotsAvailable: 2,
      slotsRemaining: 1, // 1 left because Amit's is accepted
      maxItemSize: "medium",
      notes: "Going by auto-rickshaw, can carry items up to shoe-box size. Drop-off at Hostel 4 Lounge.",
      status: "open",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    });

    // 6. Create Amit's accepted comment request on Rohan's trip
    const commentAmitId = await ctx.db.insert("comments", {
      tripId,
      requesterId: amitId,
      itemDescription: "1 packet of Surf Excel Detergent (1kg) & 1 strip of Crocin",
      quantity: "1 each",
      estimatedAmount: 220,
      status: "accepted",
      createdAt: Date.now() - 1 * 60 * 60 * 1000,
    });

    // Create Amit's chat
    const amitChatId = `${tripId}_${amitId}`;
    await ctx.db.insert("chats", {
      chatId: amitChatId,
      tripId,
      commentId: commentAmitId,
      goerId: rohanId,
      requesterId: amitId,
      paymentStatus: "advance_paid",
      deliveryStatus: "pending",
      createdAt: Date.now() - 45 * 60 * 1000,
    });

    // Create a message in Amit's chat
    await ctx.db.insert("messages", {
      chatId: amitChatId,
      senderId: amitId,
      content: "Hey Rohan, paid the ₹110 advance. Pls check!",
      createdAt: Date.now() - 40 * 60 * 1000,
    });
    await ctx.db.insert("messages", {
      chatId: amitChatId,
      senderId: rohanId,
      content: "Got it, Amit. Will pick it up tomorrow morning.",
      createdAt: Date.now() - 35 * 60 * 1000,
    });

    // 7. Create Priya's pending comment request on Rohan's trip
    await ctx.db.insert("comments", {
      tripId,
      requesterId: priyaId,
      itemDescription: "2 packets of Maggi (family pack) & a USB-C charging cable",
      quantity: "1 each",
      estimatedAmount: 350,
      status: "pending",
      createdAt: Date.now() - 30 * 60 * 1000,
    });

    // 8. Create another open trip by Amit
    await ctx.db.insert("trips", {
      goerId: amitId,
      destination: "Apollo Pharmacy, Main Gate",
      destinationCategory: "pharmacy",
      tripDate: new Date().toISOString().split("T")[0], // Today
      departureTime: "8:00 PM",
      slotsAvailable: 1,
      slotsRemaining: 1,
      maxItemSize: "small",
      notes: "Quick run for medicines. Drop-off at Hostel 2 security guard room.",
      status: "open",
      createdAt: Date.now() - 10 * 60 * 1000,
    });

    // 9. Create Priya's reverse item request on the requests board
    await ctx.db.insert("itemRequests", {
      requesterId: priyaId,
      itemName: "Cough Syrup & Strepsils Lozenges",
      itemDescription: "Benadryl Dry Cough Syrup (100ml) & 1 strip of Strepsils Honey & Lemon.",
      preferredDestination: "Any chemist outside main gate",
      urgency: "urgent",
      maxBudget: 200,
      status: "open",
      createdAt: Date.now() - 3 * 60 * 60 * 1000,
    });

    // 10. Create another flexible request on the requests board
    await ctx.db.insert("itemRequests", {
      requesterId: rohanId,
      itemName: "Tennis Balls (pack of 3)",
      itemDescription: "Wilson or Head championship tennis balls for match practice.",
      preferredDestination: "Decathlon or sports store",
      urgency: "flexible",
      maxBudget: 450,
      status: "open",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    });

    console.log("Mock data successfully seeded!");
  },
});

// Clear all data from the database
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = [
      "users",
      "trips",
      "comments",
      "itemRequests",
      "chats",
      "messages",
      "ratings",
      "authAccounts",
      "authSessions",
      "authVerificationCodes",
    ];

    for (const table of tables) {
      const records = await ctx.db.query(table as any).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
    }
    console.log("Database cleared successfully!");
  },
});
