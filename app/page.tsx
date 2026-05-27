"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "./components/Header";
import { ArrowRight, ShieldCheck, CreditCard, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === 2 ? 0 : prev + 1));
  };

  // Carousel slide copy contents
  const slideContent = [
    {
      title: "Discover Active Trips",
      subtitle: "Find peers heading to DMart, pharmacy, or city sports stores, and coordinate your package request.",
      cardTitle: "See Active Trips",
      tags: ["Groceries", "Meds"],
    },
    {
      title: "Hostel Lounge Drop-offs",
      subtitle: "Goers coordinate drop-offs directly to your hostel Lounge, lobby, or guard room.",
      cardTitle: "Delivery Lounge",
      tags: ["Hostel 4", "Lounge"],
    },
    {
      title: "1:1 Real-time Coordination",
      subtitle: "Chat with peers to clarify order specs, pay a 50% advance UPI, and verify user profiles.",
      cardTitle: "Chat Active",
      tags: ["UPI Paid", "Secure"],
    },
  ];

  // Helper for dynamic card styling
  const getCardStyle = (cardId: "map" | "students" | "errand") => {
    const base = "absolute w-[140px] h-[200px] xs:w-[160px] xs:h-[220px] sm:w-[220px] sm:h-[300px] md:w-[280px] md:h-[350px] bg-white border-2 border-maggie-primary rounded-3xl p-2.5 sm:p-4 md:p-5 shadow-xl transition-all duration-500 ease-in-out flex flex-col justify-between text-maggie-primary";
    
    if (cardId === "map") {
      if (activeSlide === 0) return `${base} scale-100 z-10 -rotate-[3deg] translate-x-0 opacity-100`;
      if (activeSlide === 1) return `${base} scale-75 z-0 -rotate-[12deg] -translate-x-[45%] translate-y-4 opacity-40 pointer-events-none`;
      return `${base} scale-75 z-0 rotate-[12deg] translate-x-[45%] translate-y-4 opacity-40 pointer-events-none`;
    }
    
    if (cardId === "students") {
      if (activeSlide === 2) return `${base} scale-100 z-10 -rotate-[3deg] translate-x-0 opacity-100`;
      if (activeSlide === 0) return `${base} scale-75 z-0 -rotate-[12deg] -translate-x-[45%] translate-y-4 opacity-40 pointer-events-none`;
      return `${base} scale-75 z-0 rotate-[12deg] translate-x-[45%] translate-y-4 opacity-40 pointer-events-none`;
    }
    
    // errand card
    if (activeSlide === 1) return `${base} scale-100 z-10 -rotate-[3deg] translate-x-0 opacity-100`;
    if (activeSlide === 2) return `${base} scale-75 z-0 -rotate-[12deg] -translate-x-[45%] translate-y-4 opacity-40 pointer-events-none`;
    return `${base} scale-75 z-0 rotate-[12deg] translate-x-[45%] translate-y-4 opacity-40 pointer-events-none`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary font-sans antialiased">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-14 sm:pt-24 sm:pb-20 bg-maggie-mint border-b-2 border-maggie-primary flex flex-col items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
          
          {/* Subtitle in Cursive */}
          <span className="font-script text-xl sm:text-2xl md:text-4xl text-maggie-primary tracking-wide mb-5 sm:mb-8 inline-block lowercase">
            meet campuscarry
          </span>

          {/* Massive Display Heading */}
          <h1 className="font-display text-3xl xs:text-4xl sm:text-[90px] md:text-[125px] lg:text-[140px] font-black tracking-tighter text-maggie-primary mb-8 sm:mb-12 uppercase leading-[0.9] sm:leading-[0.88] max-w-[1200px] w-full px-2">
            Your Hostel Guide <br />
            To Coordinating Errands <br />
            
          </h1>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative mb-6 sm:mb-8 w-full px-4 sm:px-0">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 sm:px-9 py-3.5 sm:py-5 rounded-full border-2 border-maggie-primary bg-maggie-yellow text-maggie-primary font-black text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(3,89,77,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </Link>

            <div className="relative w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 sm:px-9 py-3.5 sm:py-5 rounded-full border-2 border-maggie-primary bg-white text-maggie-primary font-black text-sm sm:text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(3,89,77,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all flex items-center justify-center"
              >
                Browse Feed
              </Link>
              
              {/* Tilted Sticker */}
              <span className="absolute -bottom-5 right-2 bg-maggie-yellow border-2 border-maggie-primary text-[9px] font-black uppercase px-2 py-0.5 rounded rotate-6 tracking-widest shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                VERIFIED!
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Description Panel */}
      <section className="py-12 sm:py-20 bg-maggie-bg border-b-2 border-maggie-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="max-w-4xl mx-auto text-lg sm:text-2xl md:text-3xl text-maggie-primary font-black leading-relaxed tracking-tight">
            CampusCarry is a free web app built for hostel students, by a hostel student. <br className="hidden sm:inline" />
            We make it easy to find peers heading to the city, coordinate essential purchases, and split errands without the noise of WhatsApp.
          </p>
        </div>
      </section>

      {/* Interactive Stacking Cards Carousel Section */}
      <section className="py-12 sm:py-20 bg-maggie-mint border-b-2 border-maggie-primary relative flex flex-col items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center relative flex flex-col items-center">
          
          <h2 className="font-display text-[clamp(2.5rem,10vw,90px)] font-black text-maggie-primary mb-8 sm:mb-12 uppercase leading-[0.95] tracking-tighter max-w-4xl">
            With CampusCarry <br />
            You Can:
          </h2>

          {/* Carousel container wrapper */}
          <div className="relative w-full max-w-5xl flex items-center justify-center">
            
            {/* Left navigation arrow */}
            <button 
              onClick={handlePrevSlide}
              className="absolute left-0 sm:left-4 z-20 h-12 w-12 rounded-full border-2 border-maggie-primary bg-maggie-yellow flex items-center justify-center font-black text-maggie-primary shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all"
            >
              <ChevronLeft className="h-6 w-6 stroke-[3]" />
            </button>

            {/* Pink Card Panel */}
            <div className="w-full mx-6 sm:mx-16 bg-maggie-pink border-2 border-maggie-primary rounded-[28px] sm:rounded-[48px] py-8 px-4 sm:py-12 sm:px-12 flex flex-col items-center justify-between shadow-[6px_6px_0px_0px_rgba(3,89,77,1)] overflow-hidden">
              
              {/* Dynamic slide description text */}
              <div className="text-center max-w-xl mx-auto mb-4 sm:mb-6 transition-all duration-300">
                <h3 className="font-display text-2xl sm:text-3xl md:text-[40px] font-black text-maggie-primary uppercase tracking-tight mb-2 leading-none">
                  {slideContent[activeSlide].title}
                </h3>
                <p className="text-sm font-semibold text-maggie-primary/75 leading-relaxed">
                  {slideContent[activeSlide].subtitle}
                </p>
              </div>

              {/* Stacked Cards Area */}
              <div className="relative h-[220px] sm:h-[320px] md:h-[400px] w-full max-w-2xl flex items-center justify-center mb-6 sm:mb-8">
                
                {/* 1. Map Mockup Card */}
                <div className={getCardStyle("map")}>
                  {/* Top area */}
                  <div className="flex-1 rounded-2xl border-2 border-maggie-primary overflow-hidden relative bg-white">
                    <img 
                      src="/app_map_mockup.png" 
                      alt="Map Mockup" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Bottom details */}
                  <div className="pt-3 text-center font-bold">
                    <span className="text-sm sm:text-base font-extrabold block text-maggie-primary">
                      {slideContent[activeSlide].cardTitle}
                    </span>
                    {/* Tags */}
                    <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
                      {slideContent[activeSlide].tags.map((tag) => (
                        <span key={tag} className="bg-maggie-yellow text-[8px] font-bold px-1.5 py-0.5 rounded border border-maggie-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Hostel Students Card */}
                <div className={getCardStyle("students")}>
                  <div className="flex-1 rounded-2xl border-2 border-maggie-primary overflow-hidden relative bg-white">
                    <img 
                      src="/hostel_students.png" 
                      alt="Hostel Students" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 text-center font-bold">
                    <span className="text-sm sm:text-base font-extrabold block text-maggie-primary">Hostel Mates</span>
                    <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
                      <span className="bg-maggie-mint text-[8px] font-bold px-1.5 py-0.5 rounded border border-maggie-primary">Verified</span>
                      <span className="bg-maggie-purple text-[8px] font-bold px-1.5 py-0.5 rounded border border-maggie-primary">VIT VELLORE</span>
                    </div>
                  </div>
                </div>

                {/* 3. Student Errand Card */}
                <div className={getCardStyle("errand")}>
                  <div className="flex-1 rounded-2xl border-2 border-maggie-primary overflow-hidden relative bg-white">
                    <img 
                      src="/student_errand.png" 
                      alt="Student Errand" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 text-center font-bold">
                    <span className="text-sm sm:text-base font-extrabold block text-maggie-primary">Errand Delivery</span>
                    <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
                      <span className="bg-maggie-purple text-[8px] font-bold px-1.5 py-0.5 rounded border border-maggie-primary">UPI Locked</span>
                      <span className="bg-maggie-mint text-[8px] font-bold px-1.5 py-0.5 rounded border border-maggie-primary">Lounge Drop</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom CTA Button */}
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-full border-2 border-maggie-primary bg-maggie-mint text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all inline-flex items-center gap-1"
              >
                Join Your Campus <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>

            </div>

            {/* Right navigation arrow */}
            <button 
              onClick={handleNextSlide}
              className="absolute right-0 sm:right-4 z-20 h-12 w-12 rounded-full border-2 border-maggie-primary bg-maggie-yellow flex items-center justify-center font-black text-maggie-primary shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all"
            >
              <ChevronRight className="h-6 w-6 stroke-[3]" />
            </button>

          </div>

        </div>
      </section>

      {/* Feature Section */}
      <section className="py-12 sm:py-20 bg-white border-b-2 border-maggie-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="font-display text-[clamp(2rem,8vw,4rem)] sm:text-6xl font-black text-maggie-primary mb-4 uppercase tracking-tighter">
              Designed for Hostel life
            </h2>
            <p className="text-maggie-primary/70 font-bold text-sm sm:text-base">
              Say goodbye to messy notice boards and noisy groups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="maggie-card p-8 bg-maggie-yellow/10">
              <div className="h-14 w-14 rounded-2xl bg-maggie-yellow border-2 border-maggie-primary text-maggie-primary flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-maggie-primary mb-3">Student Verified</h3>
              <p className="text-maggie-primary/75 text-sm font-medium leading-relaxed">
                Complete student status checks via SheerID. No spammers, only real hostel mates.
              </p>
            </div>

            {/* Card 2 */}
            <div className="maggie-card p-8 bg-maggie-mint/10">
              <div className="h-14 w-14 rounded-2xl bg-maggie-mint border-2 border-maggie-primary text-maggie-primary flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-maggie-primary mb-3">50% Advance Guarantee</h3>
              <p className="text-maggie-primary/75 text-sm font-medium leading-relaxed">
                Integrate UPI payments. Lock details down by sending 50% advance to carry with peace of mind.
              </p>
            </div>

            {/* Card 3 */}
            <div className="maggie-card p-8 bg-maggie-pink/10">
              <div className="h-14 w-14 rounded-2xl bg-maggie-pink border-2 border-maggie-primary text-maggie-primary flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-maggie-primary mb-3">Real-time Coordination</h3>
              <p className="text-maggie-primary/75 text-sm font-medium leading-relaxed">
                Once matched, instant 1:1 chat opens. Pinned status banners update as you coordinate.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20 bg-maggie-bg border-b-2 border-maggie-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <h2 className="font-display text-[clamp(2rem,8vw,4rem)] sm:text-6xl font-black text-maggie-primary mb-4 uppercase tracking-tighter">
              How It Works
            </h2>
            <p className="text-maggie-primary/70 font-semibold">Errand coordination made seamless in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-white border-2 border-maggie-primary rounded-2xl shadow-[4px_4px_0px_0px_rgba(3,89,77,1)]">
              <div className="h-12 w-12 rounded-full bg-maggie-yellow border-2 border-maggie-primary text-maggie-primary flex items-center justify-center font-extrabold text-lg mb-4 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                1
              </div>
              <h4 className="text-lg font-bold text-maggie-primary mb-2">Register E-trip</h4>
              <p className="text-maggie-primary/70 text-sm font-semibold max-w-xs">
                Goers register their city runs. Requesters pin items they need to the reverse Request Board.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-white border-2 border-maggie-primary rounded-2xl shadow-[4px_4px_0px_0px_rgba(3,89,77,1)]">
              <div className="h-12 w-12 rounded-full bg-maggie-mint border-2 border-maggie-primary text-maggie-primary flex items-center justify-center font-extrabold text-lg mb-4 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                2
              </div>
              <h4 className="text-lg font-bold text-maggie-primary mb-2">Match & Chat</h4>
              <p className="text-maggie-primary/70 text-sm font-semibold max-w-xs">
                Goer accepts request comments. Chat opens instantly. Requester handles the 50% advance UPI payment in-app.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-white border-2 border-maggie-primary rounded-2xl shadow-[4px_4px_0px_0px_rgba(3,89,77,1)]">
              <div className="h-12 w-12 rounded-full bg-maggie-pink border-2 border-maggie-primary text-maggie-primary flex items-center justify-center font-extrabold text-lg mb-4 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                3
              </div>
              <h4 className="text-lg font-bold text-maggie-primary mb-2">Deliver & Earn</h4>
              <p className="text-maggie-primary/70 text-sm font-semibold max-w-xs">
                Goer delivers the essentials back to the hostel lobby. Requester pays remaining amount and rates 5 stars.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-maggie-primary text-maggie-clay border-t-2 border-maggie-primary">
        <div className="mx-auto max-w-7xl px-4 flex flex-col items-center gap-4">
          {/* Logo text */}
          <span className="font-display text-2xl font-black uppercase tracking-tight text-maggie-clay/90">
            CampusCarry
          </span>

          {/* Divider */}
          <div className="w-12 h-0.5 bg-maggie-clay/30 rounded-full" />

          {/* Built by line with GitHub link */}
          <p className="text-xs font-bold text-maggie-clay/70 flex items-center gap-2 flex-wrap justify-center">
            Built with ♥ by
            <a
              href="https://github.com/mayankwho"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-maggie-clay font-black hover:text-maggie-yellow transition-colors"
            >
              {/* GitHub icon */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              @mayankwho
            </a>
          </p>

          <p className="text-[10px] text-maggie-clay/40 font-semibold tracking-wide">
            &copy; {new Date().getFullYear()} CampusCarry &mdash; Hostel errand coordination 
          </p>
        </div>
      </footer>
    </div>
  );
}

// Inline GraduationCap replacement
function GraduationCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
