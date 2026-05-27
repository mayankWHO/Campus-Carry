"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Header from "../components/Header";
import { useRouter } from "next/navigation";
import { useConfirm } from "../components/ModalProvider";
import { 
  MessageSquare, 
  User, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Hourglass, 
  ArrowRight,
  ShieldCheck,
  Star,
  ShoppingBag
} from "lucide-react";

export default function ChatsPage() {
  const router = useRouter();
  const { confirm, showAlert } = useConfirm();
  
  // Convex queries
  const currentUser = useQuery(api.users.currentUser);
  const myChats = useQuery(api.chats.getMyChats);
  const pendingRequests = useQuery(api.comments.getMyPendingComments);

  // Convex mutations
  const acceptComment = useMutation(api.comments.acceptComment);
  const rejectComment = useMutation(api.comments.rejectComment);

  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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

  const isLoading = !currentUser || myChats === undefined || pendingRequests === undefined;

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary font-bold">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="mb-8 sm:mb-10 text-left">
          <span className="font-script text-lg sm:text-2xl text-maggie-primary tracking-wide mb-1 inline-block lowercase">
            coordination inbox
          </span>
          <h1 className="font-display text-[clamp(2rem,10vw,4.5rem)] font-black text-maggie-primary uppercase tracking-tighter leading-[0.9]">
            My Chats & Requests
          </h1>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* 1. Pending Incoming Requests (Goer View) */}
            {pendingRequests && pendingRequests.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-maggie-orange uppercase tracking-tight flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  Errand Requests Awaiting Your Approval ({pendingRequests.length})
                </h2>
                
                <div className="space-y-4">
                  {pendingRequests.map((comment) => (
                    <div 
                      key={comment._id} 
                      className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="space-y-2">
                        {/* Requester info */}
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-maggie-clay border border-maggie-primary flex items-center justify-center font-black text-xs">
                            {comment.requester?.name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-extrabold flex items-center gap-1">
                              {comment.requester?.name}
                              <ShieldCheck className="h-4 w-4 text-maggie-primary fill-maggie-mint" />
                            </p>
                            <p className="text-[10px] text-maggie-primary/60">{comment.requester?.college}</p>
                          </div>
                          <div className="flex items-center gap-0.5 bg-maggie-yellow border border-maggie-primary px-1.5 py-0.5 rounded text-[10px] font-black shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                            ★ {comment.requester?.averageRating || "5.0"}
                          </div>
                        </div>

                        {/* Request content */}
                        <p className="text-base text-maggie-primary font-black">
                          Requested: <span className="text-maggie-orange">{comment.quantity || "1"}x</span> {comment.itemDescription}
                        </p>
                        <p className="text-xs text-maggie-primary/70 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> Trip to: <span className="font-extrabold">{comment.trip?.destination}</span>
                        </p>
                        {comment.estimatedAmount && (
                          <p className="text-xs text-maggie-primary/60">
                            Estimated Price: ₹{comment.estimatedAmount}
                          </p>
                        )}
                      </div>

                      {/* Action */}
                      <div className="flex gap-2 shrink-0 self-start md:self-center">
                        <button
                          onClick={() => handleAcceptRequest(comment._id)}
                          disabled={acceptingId === comment._id}
                          className="px-4 py-2.5 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-xs font-black shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all disabled:opacity-50 text-maggie-primary"
                        >
                          {acceptingId === comment._id ? (
                            <div className="h-4 w-4 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Accept"
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectRequest(comment._id)}
                          disabled={acceptingId === comment._id}
                          className="px-4 py-2.5 rounded-xl bg-maggie-pink border-2 border-maggie-primary text-xs font-black shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all disabled:opacity-50 text-maggie-primary"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Active Chats list */}
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-maggie-primary uppercase tracking-tight flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Active Chat Channels ({myChats?.length || 0})
              </h2>

              {myChats && myChats.length > 0 ? (
                <div className="space-y-4">
                  {myChats.map((chat) => {
                    const isGoer = chat.role === "goer";
                    const statusText = 
                      chat.deliveryStatus === "confirmed" ? "Completed" :
                      chat.deliveryStatus === "delivered" ? "Delivered" :
                      chat.paymentStatus === "advance_paid" ? "Advance Paid" : "Pending Match";

                    return (
                      <div 
                        key={chat._id} 
                        className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:translate-y-[-2px] transition-all"
                      >
                        <div className="space-y-2">
                          {/* Chat Party header */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-maggie-purple border border-maggie-primary px-2 py-0.5 rounded uppercase font-black tracking-wider text-maggie-primary">
                              As {chat.role}
                            </span>
                            <p className="text-sm font-extrabold text-maggie-primary">
                              Chatting with: <span className="text-maggie-orange">{chat.otherUser?.name}</span>
                            </p>
                          </div>

                          {/* Item/Trip summary */}
                          <h3 className="text-base font-black text-maggie-primary">
                            Errand: {chat.itemDetails || "Errand Coordination"}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 text-xs font-bold text-maggie-primary/75">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-maggie-primary/45" /> {chat.trip?.destination}
                            </span>
                            <span>•</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border border-maggie-primary text-[10px] font-black uppercase ${
                              chat.deliveryStatus === "confirmed"
                                ? "bg-maggie-mint/20"
                                : chat.deliveryStatus === "delivered" || chat.paymentStatus === "advance_paid"
                                ? "bg-maggie-yellow/30"
                                : "bg-maggie-clay"
                            }`}>
                              {statusText}
                            </span>
                          </div>
                        </div>

                        {/* Open button */}
                        <Link 
                          href={`/chat/${chat.chatId}`}
                          className="px-6 py-3 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-xs font-black shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] transition-all text-maggie-primary shrink-0 self-start md:self-center inline-flex items-center gap-1.5"
                        >
                          Open Chat <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed border-maggie-primary/25 rounded-[24px] p-12 text-center text-maggie-primary/50 font-bold bg-white/40">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 text-maggie-primary/30" />
                  <p className="text-base">No active chats found.</p>
                  <p className="text-xs text-maggie-primary/40 mt-1">
                    Once you request an errand or accept a post, your matched chats will appear here.
                  </p>
                  <Link 
                    href="/feed" 
                    className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-maggie-yellow border-2 border-maggie-primary rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] text-maggie-primary"
                  >
                    Go to Feed
                  </Link>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
