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
  ShoppingBag, 
  ArrowRight,
  ShieldCheck,
  Star,
  Plus,
  Share2
} from "lucide-react";

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, showAlert } = useConfirm();

  // Convex Queries
  const requests = useQuery(api.itemRequests.getItemRequests);
  const matchItemRequest = useMutation(api.itemRequests.matchItemRequest);

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

  const filteredRequests = requests?.filter(r => 
    r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 relative">
        
        {/* Title + Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-maggie-primary uppercase mb-1">Reverse Request Board</h1>
            <p className="text-maggie-primary/75 text-sm font-semibold">
              See what items your peers need and get them on your next trip.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-maggie-primary/60" />
            <input
              type="text"
              placeholder="Search items or Requesters..."
              className="w-full maggie-input !pl-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Requests List (Reddit Style, Single Column) */}
        {!requests ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
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
              <div className="py-12 text-center font-bold text-maggie-primary/50">
                No active item requests on the board.
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-30">
          <Link
            href="/request/new"
            className="maggie-button bg-maggie-orange text-maggie-primary text-sm font-bold gap-2 py-4 px-6 shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(3,89,77,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] transition-all text-white"
          >
            <Plus className="h-5 w-5 text-maggie-primary stroke-[3]" />
            Post Item Request
          </Link>
        </div>

      </main>
    </div>
  );
}
