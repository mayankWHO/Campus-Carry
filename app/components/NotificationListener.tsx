"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Bell, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
}

export default function NotificationListener() {
  const currentUser = useQuery(api.users.currentUser);
  const pendingRequests = useQuery(api.comments.getMyPendingComments);
  const myChats = useQuery(api.chats.getMyChats);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [initialized, setInitialized] = useState(false);

  const prevRequestsRef = useRef<any[]>([]);
  const prevChatsRef = useRef<any[]>([]);

  const addToast = (toast: ToastMessage) => {
    setToasts((prev) => {
      // Avoid duplicate toasts with the same ID
      if (prev.some((t) => t.id === toast.id)) return prev;
      return [...prev, toast];
    });
    // Automatically remove toast after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // If not authenticated or data still loading, do nothing
    if (!currentUser || pendingRequests === undefined || myChats === undefined) {
      return;
    }

    if (!initialized) {
      // Just initialize the refs on first load so we don't trigger toasts for existing states
      prevRequestsRef.current = pendingRequests || [];
      prevChatsRef.current = myChats || [];
      setInitialized(true);
      return;
    }

    // 1. Check for new pending comments/requests (Goer notifications)
    const currentRequests = pendingRequests || [];
    const prevRequests = prevRequestsRef.current;
    if (currentRequests.length > prevRequests.length) {
      const newRequests = currentRequests.filter(
        (cr) => !prevRequests.some((pr) => pr._id === cr._id)
      );
      newRequests.forEach((req) => {
        addToast({
          id: `req_${req._id}`,
          title: "New Errand Request!",
          message: `${req.requester?.name || "Someone"} requested: ${req.quantity || "1"}x ${req.itemDescription} on your trip to ${req.trip?.destination}`,
          actionLabel: "View Inbox",
          actionUrl: "/chats",
        });
      });
    }
    prevRequestsRef.current = currentRequests;

    // 2. Check for new chats (e.g. Requester request accepted, or matched reverse boards)
    const currentChats = myChats || [];
    const prevChats = prevChatsRef.current;

    if (currentChats.length > prevChats.length) {
      const newChats = currentChats.filter(
        (cc) => !prevChats.some((pc) => pc._id === cc._id)
      );
      newChats.forEach((chat) => {
        // If we are the requester, it means a goer accepted our request
        if (chat.role === "requester") {
          addToast({
            id: `chat_${chat._id}`,
            title: "Errand Request Accepted!",
            message: `${chat.otherUser?.name || "Goer"} accepted your request for: ${chat.itemDetails}. Open chat to coordinate.`,
            actionLabel: "Open Chat",
            actionUrl: `/chat/${chat.chatId}`,
          });
        }
      });
    }

    // 3. Check for new messages in active chats
    currentChats.forEach((chat) => {
      const prevChat = prevChats.find((pc) => pc.chatId === chat.chatId);
      if (chat.lastMessage) {
        const isNewMsg =
          !prevChat?.lastMessage ||
          chat.lastMessage.createdAt > prevChat.lastMessage.createdAt;

        // If there's a new message, and it was NOT sent by the current user
        if (isNewMsg && chat.lastMessage.senderId !== currentUser._id) {
          // Double check that we are not currently viewing this specific chat room
          const isViewingThisChat = window.location.pathname === `/chat/${chat.chatId}`;
          if (!isViewingThisChat) {
            addToast({
              id: `msg_${chat.chatId}_${chat.lastMessage.createdAt}`,
              title: `New message from ${chat.otherUser?.name || "User"}`,
              message: chat.lastMessage.content,
              actionLabel: "Reply",
              actionUrl: `/chat/${chat.chatId}`,
            });
          }
        }
      }
    });

    prevChatsRef.current = currentChats;
  }, [pendingRequests, myChats, currentUser, initialized]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border-2 border-maggie-primary p-4 rounded-[20px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] flex items-start gap-3 animate-bounce-subtle"
        >
          {/* Icon */}
          <div className="h-10 w-10 shrink-0 rounded-xl bg-maggie-yellow border-2 border-maggie-primary flex items-center justify-center text-maggie-primary">
            {toast.title.includes("message") || toast.title.includes("Reply") ? (
              <MessageSquare className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-black text-maggie-primary leading-none uppercase tracking-tight">
              {toast.title}
            </h4>
            <p className="text-xs font-semibold text-maggie-primary/80 line-clamp-3 leading-relaxed">
              {toast.message}
            </p>
            {toast.actionLabel && toast.actionUrl && (
              <Link
                href={toast.actionUrl}
                onClick={() => removeToast(toast.id)}
                className="inline-flex items-center gap-1 text-[10px] font-black text-maggie-orange hover:underline uppercase pt-1"
              >
                {toast.actionLabel} <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-maggie-primary/45 hover:text-maggie-primary transition-all p-1 cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
