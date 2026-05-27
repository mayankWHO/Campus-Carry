"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import { ChevronDown, ArrowLeft } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    color: "bg-maggie-mint",
    questions: [
      {
        q: "What is CampusCarry?",
        a: "CampusCarry is a free web app built for hostel students. It lets you coordinate with peers who are already heading to the city — so you can get groceries, medicines, or other essentials brought back without making a separate trip.",
      },
      {
        q: "Who can use CampusCarry?",
        a: "CampusCarry is built for hostel students at colleges across India. Anyone with a college email can sign up. The platform works best when your campus has students frequently making city runs.",
      },
      {
        q: "Is it free to use?",
        a: "Yes, completely free. There are no platform fees. You only pay the actual cost of your items plus any arrangement you make with your goer (typically they earn goodwill and the item is fetched at cost).",
      },
    ],
  },
  {
    category: "How It Works",
    color: "bg-maggie-yellow",
    questions: [
      {
        q: "How does a trip request work?",
        a: "A Goer — someone planning a city trip — registers their trip on the feed. Requesters can browse the feed, find a trip heading near their store, and drop a comment with what they need. The Goer then accepts or declines the request.",
      },
      {
        q: "What's the Request Board?",
        a: "The Request Board is the reverse flow. If you need something urgently, you can post an item request and any Goer heading out can offer to get it for you. It's like a reverse marketplace — demand first, supply second.",
      },
      {
        q: "How does the 1:1 chat work?",
        a: "Once a Goer accepts your errand request, a private chat opens between you and the Goer. You can clarify item specs, confirm quantities, share the exact store location, and coordinate hostel drop-off — all in one place.",
      },
      {
        q: "What does 'Lounge Drop-off' mean?",
        a: "Instead of hunting you down in your room, Goers drop items at your hostel's lobby, guard room, or a common lounge. You simply pick it up when convenient. No awkward scheduling needed.",
      },
    ],
  },
  {
    category: "Payments & Safety",
    color: "bg-maggie-pink",
    questions: [
      {
        q: "How does the 50% advance work?",
        a: "Once a request is accepted, the Requester sends 50% of the estimated item cost via UPI before the Goer heads out. This secures the arrangement. The remaining 50% is paid on delivery.",
      },
      {
        q: "Is my UPI payment secure?",
        a: "Payments happen directly between students via UPI — the same way you'd pay a friend. CampusCarry doesn't store or process payment credentials. The 50% advance is simply a commitment signal.",
      },
      {
        q: "What if a Goer doesn't deliver?",
        a: "The rating system keeps everyone accountable. After each transaction, both parties rate each other. Low-rated users are visible to everyone on the platform. We're a trust-based community — bad actors don't last long.",
      },
      {
        q: "How are users verified?",
        a: "Users sign up with their email and can add their college name. We're working on SheerID-based student verification for future releases. For now, the rating and review system acts as social accountability.",
      },
    ],
  },
  {
    category: "For Goers",
    color: "bg-maggie-purple",
    questions: [
      {
        q: "How do I register a trip as a Goer?",
        a: "Click 'Post Trip' in the header. Fill in your destination, trip date, departure time, and the max item size you can carry. Your trip will appear on the Campus Feed for Requesters to browse.",
      },
      {
        q: "Can I accept multiple requests on one trip?",
        a: "Yes! You can accept multiple errand requests on a single trip, up to your stated capacity. Each accepted request opens a separate chat thread so coordination stays clean.",
      },
      {
        q: "Do Goers get paid?",
        a: "Goers are reimbursed the full item cost by Requesters. There's no fixed service fee — but Requesters often tip or treat their Goer as a thank-you. It's a community-driven trust economy.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-maggie-primary rounded-2xl overflow-hidden bg-white shadow-[3px_3px_0px_0px_rgba(3,89,77,1)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 cursor-pointer"
      >
        <span className="font-bold text-sm sm:text-base text-maggie-primary leading-tight">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-maggie-primary shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t-2 border-maggie-primary/10 pt-3">
          <p className="text-sm font-medium text-maggie-primary/75 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="bg-maggie-purple border-b-2 border-maggie-primary pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex w-fit items-center gap-1.5 text-xs font-black uppercase tracking-wider text-maggie-primary/70 hover:text-maggie-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="font-script text-xl sm:text-3xl text-maggie-primary tracking-wide mb-3 inline-block lowercase">
            got questions?
          </span>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-maggie-primary">
            Frequently<br />Asked
          </h1>
        </div>
      </section>

      {/* FAQ Sections */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
        {faqs.map((section) => (
          <div key={section.category}>
            {/* Category badge */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`${section.color} border-2 border-maggie-primary text-maggie-primary text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]`}
              >
                {section.category}
              </span>
              <div className="flex-1 h-0.5 bg-maggie-primary/10 rounded-full" />
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {section.questions.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}

        {/* Still have questions CTA */}
        <div className="bg-maggie-mint border-2 border-maggie-primary rounded-[24px] p-8 shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-maggie-primary mb-2">
            Still have questions?
          </h2>
          <p className="text-sm font-semibold text-maggie-primary/70 mb-6">
            Reach out on GitHub or just jump in and try it out — it's free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/mayankwho"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-maggie-primary bg-maggie-primary text-maggie-clay font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all text-center"
            >
              GitHub ↗
            </a>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-maggie-primary bg-maggie-yellow text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all text-center"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-maggie-primary text-maggie-clay border-t-2 border-maggie-primary text-center text-xs font-bold">
        &copy; {new Date().getFullYear()} CampusCarry &mdash; Hostel errand coordination
      </footer>
    </div>
  );
}
