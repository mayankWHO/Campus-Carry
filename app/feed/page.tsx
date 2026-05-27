"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Header from "../components/Header";
import { useConfirm } from "../components/ModalProvider";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Star,
  MessageSquare,
  Share2
} from "lucide-react";

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<"trips" | "requests">("trips");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, showAlert } = useConfirm();

  // Convex Queries
  const trips = useQuery(api.trips.getTrips, {
    category: selectedCategory,
  });
  const requests = useQuery(api.itemRequests.getItemRequests);
  const matchItemRequest = useMutation(api.itemRequests.matchItemRequest);

  const isLoading = (activeTab === "trips" && !trips) || (activeTab === "requests" && !requests);

  const categories = [
    { value: undefined, label: "All" },
    { value: "grocery", label: "Grocery" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "electronics", label: "Electronics" },
    { value: "food", label: "Food" },
    { value: "other", label: "Other" },
  ];

  const filteredTrips = trips?.filter(t => 
    t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.goer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = requests?.filter(r => 
    r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMatchRequest = async (requestId: string) => {
    const isConfirmed = await confirm("Are you sure you can get this item? This will create a matched trip and open a chat.");
    if (isConfirmed) {
      try {
        const id = await matchItemRequest({ requestId: requestId as any });
        window.location.href = `/chat/${id}`;
      } catch (err: any) {
        await showAlert(err.message || "Failed to match request");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 relative pb-28 sm:pb-24">
        
        {/* Page Title */}
        <div className="mb-8 sm:mb-10 text-left">
          <span className="font-script text-lg sm:text-2xl text-maggie-primary tracking-wide mb-1 inline-block lowercase">
            welcome back
          </span>
          <h1 className="font-display text-[clamp(2.2rem,10vw,4.5rem)] font-black text-maggie-primary uppercase tracking-tighter leading-[0.9]">
            Campus Feed
          </h1>
        </div>

        {/* Toggle + Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          
          {/* Toggle */}
          <div className="flex bg-maggie-clay border-2 border-maggie-primary p-1 rounded-2xl w-full md:w-auto shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
            <button
              onClick={() => { setActiveTab("trips"); setSelectedCategory(undefined); }}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "trips"
                  ? "bg-maggie-primary text-white shadow-[2px_2px_0px_0px_rgba(3,89,77,0.1)]"
                  : "text-maggie-primary/75 hover:bg-white/40"
              }`}
            >
              Trips Feed
            </button>
            <button
              onClick={() => { setActiveTab("requests"); setSelectedCategory(undefined); }}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "requests"
                  ? "bg-maggie-primary text-white shadow-[2px_2px_0px_0px_rgba(3,89,77,0.1)]"
                  : "text-maggie-primary/75 hover:bg-white/40"
              }`}
            >
              Requests Board
            </button>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-maggie-primary/60" />
            <input
              type="text"
              placeholder={activeTab === "trips" ? "Search destinations or Goers..." : "Search items or Requesters..."}
              className="w-full maggie-input !pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters (Only for Trips Feed) */}
        {activeTab === "trips" && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                  selectedCategory === cat.value
                    ? "bg-maggie-yellow border-maggie-primary text-maggie-primary shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]"
                    : "bg-white border-maggie-primary/20 text-maggie-primary/70 hover:border-maggie-primary"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* TRIPS FEED (Reddit Style, Single Column) */}
            {activeTab === "trips" && (
              <div className="max-w-3xl mx-auto space-y-6">
                {filteredTrips && filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <div 
                      key={trip._id} 
                      className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-maggie-primary/60 mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-maggie-mint border border-maggie-primary flex items-center justify-center font-black text-[9px]">
                              {trip.goer?.name?.[0] || "U"}
                            </div>
                            <span>Posted by <span className="font-extrabold text-maggie-primary">u/{trip.goer?.name}</span></span>
                            <span>•</span>
                            <span className="hidden sm:inline">{trip.goer?.college || "Hostel Student"}</span>
                          </div>
                          <div className="flex items-center gap-0.5 bg-maggie-yellow border border-maggie-primary px-1.5 py-0.5 rounded text-[10px] font-black text-maggie-primary shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                            ★ {trip.goer?.averageRating || "5.0"}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-black text-maggie-primary mb-2 hover:text-maggie-orange transition-colors uppercase tracking-tight leading-tight">
                          <Link href={`/trip/${trip._id}`}>{trip.destination}</Link>
                        </h2>
                        
                        {/* Badges & Departure details */}
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold">
                          <span className="flex items-center gap-1 text-maggie-primary/80">
                            <Calendar className="h-3.5 w-3.5 text-maggie-primary/50" /> {trip.tripDate}
                          </span>
                          <span className="flex items-center gap-1 text-maggie-primary/80">
                            <Clock className="h-3.5 w-3.5 text-maggie-primary/50" /> {trip.departureTime}
                          </span>
                          <span className="bg-maggie-mint/20 border border-maggie-primary px-2 py-0.5 rounded text-[10px] uppercase font-black">
                            {trip.slotsRemaining} slots left
                          </span>
                          <span className="bg-maggie-pink/20 border border-maggie-primary px-2 py-0.5 rounded text-[10px] uppercase font-black">
                            {trip.maxItemSize}
                          </span>
                        </div>
                        
                        {/* Notes Description */}
                        {trip.notes && (
                          <p className="text-sm font-semibold text-maggie-primary/70 line-clamp-2 mb-4 leading-relaxed bg-maggie-clay/10 p-3 rounded-lg border border-maggie-primary/5">
                            {trip.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-maggie-primary/10 mt-2">
                        <div className="flex gap-2">
                          <Link 
                            href={`/trip/${trip._id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-maggie-clay/40 text-xs font-bold text-maggie-primary/70 transition-all"
                          >
                            <MessageSquare className="h-4 w-4" /> Request Errand
                          </Link>
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-maggie-clay/40 text-xs font-bold text-maggie-primary/70 transition-all">
                            <Share2 className="h-4 w-4" /> Share
                          </button>
                        </div>
                        
                        <Link 
                          href={`/trip/${trip._id}`}
                          className="px-4 py-2 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-xs font-extrabold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all text-maggie-primary"
                        >
                          Request Errand <ArrowRight className="h-3 w-3 inline ml-1" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center font-bold text-maggie-primary/60">
                    No active trips found. Register one below!
                  </div>
                )}
              </div>
            )}

            {/* REQUESTS BOARD (Reddit Style, Single Column) */}
            {activeTab === "requests" && (
              <div className="max-w-3xl mx-auto space-y-6">
                {filteredRequests && filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <div 
                      key={req._id} 
                      className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-maggie-primary/60 mb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-md bg-maggie-mint border border-maggie-primary flex items-center justify-center font-black text-[9px]">
                              {req.requester?.name?.[0] || "U"}
                            </div>
                            <span>Posted by <span className="font-extrabold text-maggie-primary">u/{req.requester?.name}</span></span>
                            <span>•</span>
                            <span className="hidden sm:inline">{req.requester?.college || "Hostel Student"}</span>
                          </div>
                          <div className="flex items-center gap-0.5 bg-maggie-yellow border border-maggie-primary px-1.5 py-0.5 rounded text-[10px] font-black text-maggie-primary shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                            ★ {req.requester?.averageRating || "5.0"}
                          </div>
                        </div>
                        
                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-black text-maggie-primary mb-2 uppercase tracking-tight leading-tight">
                          {req.itemName}
                        </h2>
                        
                        {/* Badges & Urgency/Budget */}
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-bold">
                          {req.preferredDestination && (
                            <span className="flex items-center gap-1 text-maggie-primary/80">
                              <MapPin className="h-3.5 w-3.5 text-maggie-primary/50" /> Store: {req.preferredDestination}
                            </span>
                          )}
                          <span className={`px-2.5 py-0.5 rounded border border-maggie-primary text-[10px] uppercase font-black ${
                            req.urgency === "urgent"
                              ? "bg-maggie-pink/30"
                              : req.urgency === "this_week"
                              ? "bg-maggie-yellow/30"
                              : "bg-maggie-clay"
                          }`}>
                            {req.urgency.replace("_", " ")}
                          </span>
                          {req.maxBudget && (
                            <span className="bg-maggie-mint/20 border border-maggie-primary px-2 py-0.5 rounded text-[10px] uppercase font-black">
                              Budget: ₹{req.maxBudget}
                            </span>
                          )}
                        </div>
                        
                        {/* Notes/Description */}
                        <p className="text-sm font-semibold text-maggie-primary/70 mb-4 leading-relaxed bg-maggie-clay/10 p-3 rounded-lg border border-maggie-primary/5">
                          {req.itemDescription}
                        </p>
                      </div>
                      
                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-maggie-primary/10 mt-2">
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-maggie-clay/40 text-xs font-bold text-maggie-primary/70 transition-all">
                            <Share2 className="h-4 w-4" /> Share
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleMatchRequest(req._id)}
                          className="px-4 py-2 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-xs font-extrabold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all text-maggie-primary"
                        >
                          I can get this <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center font-bold text-maggie-primary/60">
                    No active item requests on the board.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Floating Actions — raised higher on mobile to avoid overlap with content */}
        <div className="fixed bottom-6 right-4 sm:right-6 flex flex-col gap-2 sm:gap-3 z-30">
          <Link
            href="/request/new"
            className="maggie-button bg-white text-maggie-primary text-xs font-bold gap-1.5 shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] py-2.5 sm:py-3 px-4 sm:px-5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden xs:inline">Request Item</span>
            <span className="xs:hidden">Request</span>
          </Link>
          <Link
            href="/trip/new"
            className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-maggie-orange border-2 border-maggie-primary text-white hover:bg-maggie-orange/90 shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(3,89,77,1)] transition-all self-end"
            title="Post a Trip"
          >
            <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-maggie-primary stroke-[3]" />
          </Link>
        </div>

      </main>
    </div>
  );
}
