"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreditCard, X, ArrowRight } from "lucide-react";

export default function UpiPromptModal() {
  const currentUser = useQuery(api.users.currentUser);
  const updateProfile = useMutation(api.users.updateProfile);

  const [isOpen, setIsOpen] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Wait until currentUser is loaded
    if (currentUser === undefined) return;

    // Check if user is logged in, verified, has NO upiId, and hasn't dismissed the modal in this session
    const isVerified = currentUser?.verificationStatus === "verified";
    const hasUpi = !!currentUser?.upiId;
    const isDismissed = sessionStorage.getItem("cc_upi_prompt_dismissed") === "true";

    if (currentUser && isVerified && !hasUpi && !isDismissed) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [currentUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.trim()) {
      setError("Please enter a valid UPI ID");
      return;
    }

    // Basic UPI ID validation: must contain @
    if (!upiId.includes("@")) {
      setError("UPI ID must contain '@' (e.g. name@okaxis)");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await updateProfile({ upiId: upiId.trim() });
      setIsOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save UPI ID. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem("cc_upi_prompt_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-maggie-primary p-6 sm:p-8 rounded-[24px] max-w-md w-full shadow-[6px_6px_0px_0px_rgba(3,89,77,1)] relative text-maggie-primary font-bold animate-[zoomIn_0.15s_ease-out]">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-maggie-primary/45 hover:text-maggie-primary transition-all p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon Header */}
          <div className="h-14 w-14 rounded-2xl border-2 border-maggie-primary bg-maggie-yellow flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
            <CreditCard className="h-7 w-7 text-maggie-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-display">
              Add Your UPI ID
            </h3>
            <p className="text-sm font-semibold text-maggie-primary/75 leading-relaxed max-w-sm">
              To request items or post trips, we need your UPI ID. Peers will pay you directly using this ID.
            </p>
          </div>

          {error && (
            <div className="w-full text-center text-xs font-black text-maggie-orange bg-maggie-pink/20 border-2 border-maggie-primary py-2 px-3 rounded-xl leading-snug">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="w-full space-y-4 pt-2">
            <div className="text-left">
              <label htmlFor="upi-id" className="block text-xs font-bold text-maggie-primary/70 mb-1 uppercase tracking-wider">
                UPI ID / VPA
              </label>
              <input
                id="upi-id"
                type="text"
                placeholder="yourname@bank or 9876543210@upi"
                className="w-full bg-white border-2 border-maggie-primary rounded-xl px-4 py-2.5 text-maggie-primary text-sm font-semibold placeholder:text-maggie-primary/30 focus:outline-none focus:ring-1 focus:ring-maggie-primary"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex gap-3 w-full pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl border-2 border-maggie-primary bg-maggie-clay hover:bg-maggie-clay/80 text-maggie-primary text-xs font-black transition-all cursor-pointer text-center"
              >
                Later
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl border-2 border-maggie-primary bg-maggie-mint hover:bg-maggie-mint/90 text-maggie-primary text-xs font-black shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] transition-all cursor-pointer text-center flex items-center justify-center gap-1"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Save UPI <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
