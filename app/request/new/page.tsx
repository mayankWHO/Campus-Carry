"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { ArrowLeft, ShoppingBag, MapPin, DollarSign, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NewItemRequestPage() {
  const router = useRouter();
  const createItemRequest = useMutation(api.itemRequests.createItemRequest);

  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [preferredDestination, setPreferredDestination] = useState("");
  const [urgency, setUrgency] = useState<"flexible" | "this_week" | "urgent">("flexible");
  const [maxBudget, setMaxBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemDescription || !urgency) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createItemRequest({
        itemName,
        itemDescription,
        preferredDestination: preferredDestination ? preferredDestination : undefined,
        urgency,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
      });
      router.push("/requests");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to post item request. Ensure you are verified.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/requests" className="inline-flex items-center gap-1.5 text-maggie-primary font-bold hover:underline text-sm mb-6 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Requests Board
        </Link>

        <div className="bg-white border-2 border-maggie-primary p-8 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(3,89,77,1)]">
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-maggie-primary mb-2 uppercase">Request an Item</h1>
          <p className="text-maggie-primary/75 text-sm font-semibold mb-6">
            Post an errand you need. Any verified peer heading out can match your request and coordinate delivery.
          </p>

          {error && (
            <div className="rounded-xl bg-maggie-pink/30 border-2 border-maggie-primary p-4 text-sm font-bold text-maggie-primary mb-6 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-bold text-maggie-primary mb-2">
                What item do you need? *
              </label>
              <div className="relative">
                <ShoppingBag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-maggie-primary/60" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Cough Syrup, USB-C Cable, Maggi Packets"
                  className="w-full maggie-input !pl-11"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-maggie-primary mb-2">
                Item Description / Details *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe details: brand, size, quantity, or specific shop locations if any."
                className="w-full maggie-input"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
            </div>

            {/* Preferred Store */}
            <div>
              <label className="block text-sm font-bold text-maggie-primary mb-2">
                Preferred Store/Destination (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-maggie-primary/60" />
                <input
                  type="text"
                  placeholder="e.g. Campus Pharmacy, D-Mart"
                  className="w-full maggie-input !pl-11"
                  value={preferredDestination}
                  onChange={(e) => setPreferredDestination(e.target.value)}
                />
              </div>
            </div>

            {/* Urgency & Budget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-maggie-primary mb-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Urgency Level *
                </label>
                <select
                  className="w-full maggie-input"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                >
                  <option value="flexible">Flexible (Whenever someone goes)</option>
                  <option value="this_week">This Week (Need in a few days)</option>
                  <option value="urgent">Urgent (Need in 24 hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-maggie-primary mb-2 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" /> Max Budget (₹, Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  className="w-full maggie-input"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full maggie-button bg-maggie-mint hover:bg-maggie-mint/90 font-bold"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "Post Request"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
