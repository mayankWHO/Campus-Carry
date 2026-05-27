"use client";

import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import { ArrowLeft, ArrowRight, Github, ShieldCheck, MessageSquare, CreditCard, Zap } from "lucide-react";

const techStack = [
  { name: "Next.js 15", desc: "App Router, server components", color: "bg-maggie-clay" },
  { name: "Convex", desc: "Realtime backend & database", color: "bg-maggie-mint" },
  { name: "Convex Auth", desc: "Authentication", color: "bg-maggie-yellow" },
  { name: "Tailwind CSS v4", desc: "Utility-first styling", color: "bg-maggie-purple" },
  { name: "TypeScript", desc: "End-to-end type safety", color: "bg-maggie-pink" },
  { name: "Lucide React", desc: "Icon system", color: "bg-maggie-clay" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Trust-first",
    desc: "The rating system and 50% advance keep every transaction accountable. No anonymous flaking — every goer has skin in the game.",
    color: "bg-maggie-yellow",
    num: "01",
  },
  {
    icon: MessageSquare,
    title: "Zero noise",
    desc: "1:1 structured chats replace chaotic WhatsApp groups. Every errand gets its own clean thread — no buried messages, no forgotten requests.",
    color: "bg-maggie-mint",
    num: "02",
  },
  {
    icon: CreditCard,
    title: "Fair payments",
    desc: "UPI-native, peer-to-peer. No platform cuts, no hidden fees. Just students helping students at the actual cost of the item.",
    color: "bg-maggie-pink",
    num: "03",
  },
  {
    icon: Zap,
    title: "Peer-powered",
    desc: "No delivery agents, no middlemen. Your hostel neighbours carry your errands — building a culture of reciprocity one trip at a time.",
    color: "bg-maggie-purple",
    num: "04",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary font-sans antialiased">
      <Header />

      {/* Hero */}
      <section className="bg-maggie-pink border-b-2 border-maggie-primary pt-14 pb-12 sm:pt-20 sm:pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex w-fit items-center gap-1.5 text-xs font-black uppercase tracking-wider text-maggie-primary/70 hover:text-maggie-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <span className="font-script text-xl sm:text-3xl text-maggie-primary tracking-wide mb-3 inline-block lowercase">
            the story behind it
          </span>
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-maggie-primary">
            About<br />CampusCarry
          </h1>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">

        {/* The Problem */}
        <section className="space-y-4">
          <span className="bg-maggie-yellow border-2 border-maggie-primary text-maggie-primary text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] inline-block">
            The Problem
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.95] text-maggie-primary">
            Hostel life is a coordination nightmare
          </h2>
          <div className="space-y-4 text-base font-semibold text-maggie-primary/75 leading-relaxed max-w-2xl">
            <p>
              You're in a hostel. You need paracetamol, a protein bar, or a specific item from DMart — but you can't leave campus right now. Meanwhile, your hostel-mate is literally heading to the same store in 30 minutes.
            </p>
            <p>
              The current solution? Spam five different WhatsApp groups, hope someone sees it, get buried under memes, and still not get your item. Or just skip it entirely.
            </p>
            <p className="font-black text-maggie-primary text-lg">
              There had to be a better way.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="h-0.5 bg-maggie-primary/10 rounded-full" />

        {/* The Solution */}
        <section className="space-y-4">
          <span className="bg-maggie-mint border-2 border-maggie-primary text-maggie-primary text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] inline-block">
            The Solution
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-[0.95] text-maggie-primary">
            Structured errand coordination
          </h2>
          <div className="text-base font-semibold text-maggie-primary/75 leading-relaxed max-w-2xl space-y-4">
            <p>
              CampusCarry is a structured feed where Goers post their upcoming city trips and Requesters drop errand requests against active trips. One confirmed match = one 1:1 chat = one clean errand, coordinated without noise.
            </p>
            <p>
              No group chats. No follow-up spam. No ghosting — because the 50% UPI advance keeps everyone committed.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="space-y-6">
          <span className="bg-maggie-purple border-2 border-maggie-primary text-maggie-primary text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] inline-block">
            Our Values
          </span>
          <div className="flex flex-col gap-4">
            {values.map((v) => (
              <div
                key={v.title}
                className={`${v.color} border-2 border-maggie-primary rounded-[24px] p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] flex flex-col sm:flex-row items-start gap-5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(3,89,77,1)] transition-all`}
              >
                {/* Big number */}
                <span className="font-display text-6xl sm:text-8xl font-black text-maggie-primary/15 leading-none select-none shrink-0">
                  {v.num}
                </span>
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-white/60 border-2 border-maggie-primary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] shrink-0">
                      <v.icon className="h-5 w-5 text-maggie-primary" />
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-maggie-primary leading-none">
                      {v.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-maggie-primary/75 leading-relaxed max-w-xl">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-0.5 bg-maggie-primary/10 rounded-full" />

        {/* Tech Stack */}
        <section className="space-y-6">
          <span className="bg-maggie-clay border-2 border-maggie-primary text-maggie-primary text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] inline-block">
            Built With
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className={`${tech.color} border-2 border-maggie-primary rounded-2xl px-4 py-3 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]`}
              >
                <p className="font-black text-sm text-maggie-primary">{tech.name}</p>
                <p className="text-[11px] font-semibold text-maggie-primary/65 leading-tight mt-0.5">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-0.5 bg-maggie-primary/10 rounded-full" />

        {/* Builder card */}
        <section className="space-y-4">
          <span className="bg-maggie-pink border-2 border-maggie-primary text-maggie-primary text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] inline-block">
            The Builder
          </span>
          <div className="bg-white border-2 border-maggie-primary rounded-[24px] p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="h-20 w-20 shrink-0 rounded-2xl bg-maggie-mint border-2 border-maggie-primary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
              <span className="font-display text-3xl font-black text-maggie-primary uppercase">M</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-xl text-maggie-primary">Mayank</h3>
              <p className="text-xs font-bold text-maggie-primary/60 uppercase tracking-wider">VIT Vellore · Hostel Student</p>
              <p className="text-sm font-semibold text-maggie-primary/75 leading-relaxed max-w-lg">
                Built CampusCarry from scratch as a hackathon project — because the problem was real and the solution was overdue. A hostel student solving the problems he faces every week.
              </p>
              <a
                href="https://github.com/mayankwho"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-maggie-primary text-maggie-clay font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                @mayankwho
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-maggie-mint border-2 border-maggie-primary rounded-[24px] p-8 shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-maggie-primary mb-2">
            Ready to try it?
          </h2>
          <p className="text-sm font-semibold text-maggie-primary/70 mb-6">
            Sign up in seconds. No app download needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-maggie-primary bg-maggie-yellow text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all inline-flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-maggie-primary bg-white text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all text-center"
            >
              Read FAQs
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
