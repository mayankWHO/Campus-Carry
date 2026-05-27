"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import { ArrowLeft, Calendar, Clock, MapPin, Package, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NewTripPage() {
  const router = useRouter();
  const createTrip = useMutation(api.trips.createTrip);

  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState<"grocery" | "pharmacy" | "electronics" | "food" | "other">("grocery");
  const [tripDate, setTripDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [slotsAvailable, setSlotsAvailable] = useState(2);
  const [maxItemSize, setMaxItemSize] = useState<"small" | "medium" | "large">("medium");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !tripDate || !departureTime || !slotsAvailable || !maxItemSize) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTrip({
        destination,
        destinationCategory: category,
        tripDate,
        departureTime,
        slotsAvailable,
        maxItemSize,
        notes: notes ? notes : undefined,
      });
      router.push("/feed");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create trip. Ensure you are verified.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-maggie-primary font-bold hover:underline text-sm mb-6 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>

        <div className="bg-white border-2 border-maggie-primary p-8 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(3,89,77,1)]">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-maggie-primary mb-2 uppercase tracking-tight">Post a Trip</h1>
          <p className="text-maggie-primary/75 text-sm font-semibold mb-6">
            Let hostel mates know you are heading out so they can request items for you to carry back.
          </p>

          {error && (
            <div className="rounded-xl bg-maggie-pink/30 border-2 border-maggie-primary p-4 text-sm font-bold text-maggie-primary mb-6 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Destination */}
            <div>
              <label className="block text-sm font-bold text-maggie-primary mb-2">
                Where are you going? *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-maggie-primary/60" />
                <input
                  type="text"
                  required
                  placeholder="e.g. D-Mart Mall, City Center Medicals"
                  className="w-full maggie-input !pl-11"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            {/* Category & Item Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-maggie-primary mb-2">
                  Destination Category *
                </label>
                <select
                  className="w-full maggie-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="grocery">Grocery Store</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="electronics">Electronics Shop</option>
                  <option value="food">Restaurant / Food</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-maggie-primary mb-2 flex items-center gap-1">
                  <Package className="h-4 w-4" /> Max Item Size Capacity *
                </label>
                <select
                  className="w-full maggie-input"
                  value={maxItemSize}
                  onChange={(e) => setMaxItemSize(e.target.value as any)}
                >
                  <option value="small">Small (Fits in a standard backpack)</option>
                  <option value="medium">Medium (Shoebox size or minor bag)</option>
                  <option value="large">Large (Bigger items / heavy carries)</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-maggie-primary mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Date of Trip *
                </label>
                <input
                  type="date"
                  required
                  className="w-full maggie-input"
                  value={tripDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTripDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-maggie-primary mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Approximate Departure Time *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 AM or Evening 6 PM"
                  className="w-full maggie-input"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>
            </div>

            {/* Slots available */}
            <div>
              <label className="block text-sm font-bold text-maggie-primary mb-2 flex items-center gap-1">
                <Users className="h-4 w-4" /> Maximum Slots (Peers you can carry for) *
              </label>
              <select
                className="w-full maggie-input"
                value={slotsAvailable}
                onChange={(e) => setSlotsAvailable(Number(e.target.value))}
              >
                <option value={1}>1 student request</option>
                <option value={2}>2 student requests</option>
                <option value={3}>3 or more requests</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-maggie-primary mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                placeholder="e.g. 'I am going by bicycle so keep packages light' or 'Accepting advance payments only'"
                rows={3}
                className="w-full maggie-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
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
                "Post Trip"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
