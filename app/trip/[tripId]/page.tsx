"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import { useConfirm } from "../../components/ModalProvider";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Package, 
  MessageSquare, 
  CheckCircle2, 
  Hourglass, 
  AlertTriangle,
  Send,
  ShieldCheck
} from "lucide-react";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as any;

  // Custom modal hooks
  const { confirm, showAlert } = useConfirm();

  // Convex hooks
  const currentUser = useQuery(api.users.currentUser);
  const trip = useQuery(api.trips.getTrip, { tripId });
  const comments = useQuery(api.comments.getComments, { tripId });
  
  const createComment = useMutation(api.comments.createComment);
  const acceptComment = useMutation(api.comments.acceptComment);
  const rejectComment = useMutation(api.comments.rejectComment);

  // Form State
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const isGoer = currentUser && trip && trip.goerId === currentUser._id;

  const handlePostRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDescription.trim()) {
      setFormError("Please describe the items you need.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      await createComment({
        tripId,
        itemDescription,
        quantity: quantity ? quantity : undefined,
        estimatedAmount: estimatedAmount ? Number(estimatedAmount) : undefined,
      });
      setItemDescription("");
      setQuantity("");
      setEstimatedAmount("");
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to post request.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAcceptRequest = async (commentId: string) => {
    const isConfirmed = await confirm("Accepting this request commits you to bringing it. Proceed to chat?");
    if (!isConfirmed) {
      return;
    }
    setAcceptingId(commentId);
    try {
      const chatId = await acceptComment({ commentId: commentId as any });
      router.push(`/chat/${chatId}`);
    } catch (err: any) {
      console.error(err);
      await showAlert(err.message || "Failed to accept request.");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (commentId: string) => {
    const isConfirmed = await confirm("Are you sure you want to decline this request?");
    if (!isConfirmed) {
      return;
    }
    setAcceptingId(commentId);
    try {
      await rejectComment({ commentId: commentId as any });
    } catch (err: any) {
      console.error(err);
      await showAlert(err.message || "Failed to decline request.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (!trip || !currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-maggie-bg text-maggie-primary">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-maggie-bg text-maggie-primary">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-maggie-primary font-bold hover:underline text-sm mb-6 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Feed
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Trip Details Card */}
            <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)]">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider border-2 ${
                  trip.status === "open"
                    ? "bg-maggie-mint/20 border-maggie-primary text-maggie-primary"
                    : trip.status === "full"
                    ? "bg-maggie-yellow/30 border-maggie-primary text-maggie-primary"
                    : trip.status === "completed"
                    ? "bg-maggie-mint/10 border-maggie-primary text-maggie-primary"
                    : "bg-maggie-clay border-maggie-primary/30 text-maggie-primary/60"
                }`}>
                  {trip.status}
                </span>
                <span className="text-xs font-bold text-maggie-primary/60">
                  Posted {new Date(trip.createdAt).toLocaleString()}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-black text-maggie-primary flex items-center gap-2 mb-4 uppercase tracking-tight">
                <MapPin className="h-6 w-6 text-maggie-orange" />
                {trip.destination}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 py-4 border-y-2 border-maggie-primary/10 font-bold">
                <div>
                  <p className="text-xs text-maggie-primary/50 uppercase tracking-wider mb-1">Departure Date</p>
                  <p className="text-sm text-maggie-primary flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {trip.tripDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-maggie-primary/50 uppercase tracking-wider mb-1">Departure Time</p>
                  <p className="text-sm text-maggie-primary flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {trip.departureTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-maggie-primary/50 uppercase tracking-wider mb-1">Max Package Size</p>
                  <p className="text-sm text-maggie-primary flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {trip.maxItemSize}
                  </p>
                </div>
              </div>

              {trip.notes && (
                <div>
                  <h4 className="text-sm font-black text-maggie-primary mb-1.5">Goer Notes</h4>
                  <p className="text-sm font-semibold text-maggie-primary/85 bg-maggie-clay/40 p-4 rounded-xl border-2 border-maggie-primary/15">
                    {trip.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Errand Requests / Comments List */}
            <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)]">
              <h2 className="font-display text-xl sm:text-2xl font-black text-maggie-primary mb-4 flex items-center gap-2 uppercase tracking-tight">
                <MessageSquare className="h-5 w-5" />
                Errand Requests ({comments?.length || 0})
              </h2>

              <div className="space-y-4">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="p-4 rounded-xl bg-maggie-clay/30 border-2 border-maggie-primary/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-bold text-maggie-primary">
                      
                      {/* Requester request details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-maggie-primary">{comment.requester?.name}</p>
                          <div className="flex items-center gap-0.5 text-xs text-maggie-primary bg-maggie-yellow px-1.5 py-0.5 rounded border border-maggie-primary shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                            <Star className="h-3 w-3 fill-maggie-primary text-maggie-primary" />
                            <span>{comment.requester?.averageRating || "5.0"}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-maggie-primary/90">
                          <span className="font-extrabold text-maggie-orange">{comment.quantity || "1"}x</span> {comment.itemDescription}
                        </p>
                        
                        {comment.estimatedAmount && (
                          <p className="text-xs text-maggie-primary/60">
                            Estimated: ₹{comment.estimatedAmount}
                          </p>
                        )}
                      </div>

                      {/* Goer Approval controls */}
                      <div>
                        {comment.status === "accepted" ? (
                          <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-maggie-mint/30 border-2 border-maggie-primary text-maggie-primary text-xs font-bold">
                              <CheckCircle2 className="h-4 w-4 fill-maggie-primary text-white" /> Matched
                            </div>
                            {(isGoer || (currentUser && currentUser._id === comment.requesterId)) && (
                              <Link
                                href={`/chat/${trip._id}_${comment.requesterId}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-maggie-yellow border-2 border-maggie-primary text-maggie-primary text-xs font-extrabold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all"
                              >
                                <MessageSquare className="h-3.5 w-3.5" /> Chat
                              </Link>
                            )}
                          </div>
                        ) : comment.status === "rejected" ? (
                          <span className="text-zinc-500 text-xs font-bold">Declined</span>
                        ) : (
                          <>
                            {isGoer ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(comment._id)}
                                  disabled={acceptingId === comment._id || trip.slotsRemaining <= 0}
                                  className="px-4 py-2 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-maggie-primary text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all disabled:opacity-50"
                                >
                                  {acceptingId === comment._id ? (
                                    <div className="h-4 w-4 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                                  ) : (
                                    "Accept"
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(comment._id)}
                                  disabled={acceptingId === comment._id}
                                  className="px-4 py-2 rounded-xl bg-maggie-pink border-2 border-maggie-primary text-maggie-primary text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-maggie-clay border-2 border-maggie-primary/30 text-maggie-primary/60 text-xs font-bold">
                                <Hourglass className="h-3.5 w-3.5" /> Pending
                              </div>
                            )}
                          </>
                        )}
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-maggie-primary/50 text-sm font-bold">
                    No requests posted yet. Be the first to ask Rohan!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Goer Card & Request Form */}
          <div className="space-y-6">
            
            {/* Goer Profile Card */}
            <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] text-center text-maggie-primary">
              <div className="h-16 w-16 rounded-2xl bg-maggie-mint border-2 border-maggie-primary flex items-center justify-center font-black text-xl text-maggie-primary mx-auto mb-4 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
                {trip.goer?.name?.[0] || "U"}
              </div>
              <h3 className="text-lg font-black mb-1 flex items-center justify-center gap-1">
                {trip.goer?.name}
                <ShieldCheck className="h-4 w-4 text-maggie-primary fill-maggie-mint" />
              </h3>
              <p className="text-xs font-bold text-maggie-primary/65 mb-3">{trip.goer?.college || "Verified Student"}</p>

              <div className="flex items-center justify-center gap-6 py-3 border-t-2 border-maggie-primary/10 mt-4 font-bold">
                <div>
                  <div className="flex items-center gap-0.5 text-maggie-primary font-black justify-center bg-maggie-yellow px-1.5 py-0.5 rounded border border-maggie-primary shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                    <Star className="h-4 w-4 fill-maggie-primary text-maggie-primary" />
                    {trip.goer?.averageRating || "5.0"}
                  </div>
                  <span className="text-[10px] text-maggie-primary/50 uppercase tracking-wider block mt-2">Rating</span>
                </div>
                <div className="h-8 w-px bg-maggie-primary/10" />
                <div>
                  <div className="text-maggie-primary font-black text-lg">{trip.goer?.totalTripsAsGoer || 0}</div>
                  <span className="text-[10px] text-maggie-primary/50 uppercase tracking-wider block mt-1">Trips Run</span>
                </div>
              </div>
            </div>

            {/* Request Form */}
            {!isGoer && (
              <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] text-maggie-primary">
                <h3 className="text-lg font-black mb-1">Request an Item</h3>
                <p className="text-xs font-semibold text-maggie-primary/65 mb-4">
                  Request items from Rohan. You'll coordinate a 50% advance via UPI once accepted.
                </p>

                {formError && (
                  <div className="rounded-xl bg-maggie-pink/30 border-2 border-maggie-primary p-3 text-xs font-bold mb-4">
                    {formError}
                  </div>
                )}

                {trip.status !== "open" ? (
                  <div className="p-3 bg-maggie-yellow/30 border-2 border-maggie-primary rounded-xl text-xs font-bold text-center">
                    This trip is full or completed.
                  </div>
                ) : (
                  <form onSubmit={handlePostRequest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Item Details *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2 Maggi Packets, USB-C Cable"
                        className="w-full maggie-input py-2"
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        disabled={formLoading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1">Quantity</label>
                        <input
                          type="text"
                          placeholder="e.g. 2 packs"
                          className="w-full maggie-input py-2"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          disabled={formLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Est. Price (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 150"
                          className="w-full maggie-input py-2"
                          value={estimatedAmount}
                          onChange={(e) => setEstimatedAmount(e.target.value)}
                          disabled={formLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={formLoading || !itemDescription.trim()}
                      className="w-full maggie-button bg-maggie-mint hover:bg-maggie-mint/90 font-bold"
                    >
                      {formLoading ? (
                        <div className="h-4 w-4 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 ml-0.5" /> Submit Request
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
