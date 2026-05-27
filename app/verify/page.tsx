"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck, GraduationCap } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const user = useQuery(api.users.currentUser);
  const simulateVerification = useMutation(api.users.simulateVerification);
  const [college, setCollege] = useState("Indian Institute of Technology (IIT), Delhi");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already verified, or send to login if not authenticated
  useEffect(() => {
    if (user === null) {
      // user is explicitly null (not undefined/loading) = not authenticated
      router.push("/login");
      return;
    }
    if (user && user.verificationStatus === "verified") {
      router.push("/feed");
    }
  }, [user, router]);

  const handleSimulate = async () => {
    if (!college.trim()) return;
    setLoading(true);
    try {
      await simulateVerification({ college });
      setSuccess(true);
      setTimeout(() => {
        router.push("/feed");
        router.refresh();
      }, 1500);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-maggie-bg">
        <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-maggie-bg p-4 text-maggie-primary">
      <div className="w-full max-w-lg bg-white border-2 border-maggie-primary p-8 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(3,89,77,1)]">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-maggie-yellow border-2 border-maggie-primary text-maggie-primary mb-6 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight uppercase">
            Student Verification
          </h1>
          <p className="mt-2 text-maggie-primary/70 text-sm font-semibold max-w-sm">
            CampusCarry requires verified student status to ensure safety, hostel trust, and reliability.
          </p>
        </div>

        {/* Status indicator */}
        <div className="mt-6 p-4 rounded-xl border-2 border-maggie-primary bg-maggie-bg flex items-center gap-3">
          {success || user.verificationStatus === "verified" ? (
            <>
              <ShieldCheck className="h-6 w-6 text-maggie-primary fill-maggie-mint shrink-0" />
              <div className="text-left font-bold">
                <p className="text-sm text-maggie-primary">Verified Student Status</p>
                <p className="text-xs text-maggie-primary/75">Loading feed...</p>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert className="h-6 w-6 text-maggie-primary fill-maggie-pink shrink-0" />
              <div className="text-left font-bold">
                <p className="text-sm text-maggie-primary">Verification Pending</p>
                <p className="text-xs text-maggie-primary/70">Please complete verification to proceed.</p>
              </div>
            </>
          )}
        </div>

        {/* Mock SheerID Widget Container */}
        <div className="mt-8 border-2 border-maggie-primary rounded-2xl bg-maggie-clay p-6 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-maggie-primary text-maggie-clay text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded">
            SheerID Widget
          </div>
          
          <h3 className="text-maggie-primary text-sm font-extrabold mb-4">
            Verify College Student Status
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-maggie-primary mb-1">Select Institution</label>
              <input
                type="text"
                className="w-full bg-white border-2 border-maggie-primary rounded-xl px-3 py-2 text-maggie-primary text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-maggie-primary"
                placeholder="Search College Name..."
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={loading || success}
              />
            </div>
            
            <p className="text-xs font-semibold text-maggie-primary/75 leading-relaxed bg-white/40 p-3 rounded-lg border border-maggie-primary/30">
              For this presentation, bypass document uploading. Enter your college name and click below to simulate instant student verification success.
            </p>

            <button
              onClick={handleSimulate}
              disabled={loading || success || !college.trim()}
              className="w-full maggie-button bg-maggie-mint hover:bg-maggie-mint/90 font-bold"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "Simulate SheerID Verification"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
