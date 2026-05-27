"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LogOut, Bell, Menu, X } from "lucide-react";
import { useConfirm } from "./ModalProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.currentUser);
  const pendingRequests = useQuery(api.comments.getMyPendingComments);

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const acceptComment = useMutation(api.comments.acceptComment);
  const rejectComment = useMutation(api.comments.rejectComment);
  const { confirm, showAlert } = useConfirm();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    window.location.href = "/";
  };

  const handleAcceptRequest = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    const isConfirmed = await confirm("Accepting this request commits you to bringing it. Proceed to chat?");
    if (!isConfirmed) {
      return;
    }
    try {
      const chatId = await acceptComment({ commentId: commentId as any });
      setShowNotifications(false);
      router.push(`/chat/${chatId}`);
    } catch (err: any) {
      console.error(err);
      await showAlert(err.message || "Failed to accept request.");
    }
  };

  const handleRejectRequest = async (e: React.MouseEvent, commentId: string) => {
    e.stopPropagation();
    const isConfirmed = await confirm("Are you sure you want to decline this request?");
    if (!isConfirmed) {
      return;
    }
    try {
      await rejectComment({ commentId: commentId as any });
    } catch (err: any) {
      console.error(err);
      await showAlert(err.message || "Failed to decline request.");
    }
  };

  const isAuthRoute =
    pathname !== "/" &&
    pathname !== "/login" &&
    pathname !== "/signup" &&
    pathname !== "/faq" &&
    pathname !== "/about";
  const showAuthNav = !!currentUser || isAuthRoute;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="w-full bg-maggie-mint py-3 px-4 sm:px-6 lg:px-8 border-b-2 border-maggie-primary relative z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* ── LEFT: FAQs & About (hidden on mobile) ── */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/faq"
              className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-maggie-purple text-maggie-primary font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] transition-all"
            >
              FAQs
            </Link>
            <Link
              href="/about"
              className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-maggie-pink text-maggie-primary font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] transition-all"
            >
              About
            </Link>
          </div>

          {/* ── CENTER: Logo ── */}
          <Link href={currentUser || isAuthRoute ? "/feed" : "/"} className="flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90 hover:scale-105 transition-transform">
              <path
                d="M8 36 V18 A12 12 0 0 1 32 18 V36"
                stroke="#03594d"
                strokeWidth="4"
                fill="#03594d"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M11 36 V18 A9 9 0 0 1 29 18 V36"
                fill="#ffff94"
                stroke="#03594d"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="17" cy="18" r="2.5" fill="#03594d" />
              <circle cx="23" cy="18" r="2.5" fill="#03594d" />
            </svg>
          </Link>

          {/* ── RIGHT: Desktop nav buttons (hidden on mobile) ── */}
          <div className="hidden sm:flex items-center gap-3">
            {showAuthNav ? (
              <>
                {/* Chats Link */}
                <div className="relative flex items-center">
                  <Link
                    href="/chats"
                    className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-maggie-yellow text-maggie-primary font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all flex items-center gap-2"
                  >
                    <span>Chats</span>
                    {pendingRequests && pendingRequests.length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-maggie-orange text-white text-[10px] font-black border border-maggie-primary animate-pulse">
                        {pendingRequests.length}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-full border-2 border-maggie-primary bg-white hover:bg-zinc-50 text-maggie-primary shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all cursor-pointer relative flex items-center justify-center"
                    title="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {pendingRequests && pendingRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-maggie-orange text-white text-[9px] font-black border border-maggie-primary animate-pulse">
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border-2 border-maggie-primary rounded-[20px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] z-50 overflow-hidden text-maggie-primary font-bold">
                      <div className="bg-maggie-clay border-b-2 border-maggie-primary p-3 flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider">Pending Requests</span>
                        {pendingRequests && pendingRequests.length > 0 && (
                          <span className="bg-maggie-orange text-white text-[10px] px-2 py-0.5 rounded-full border border-maggie-primary font-black">
                            {pendingRequests.length} new
                          </span>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y-2 divide-maggie-primary/10">
                        {pendingRequests && pendingRequests.length > 0 ? (
                          pendingRequests.map((req) => (
                            <div key={req._id} className="p-3 space-y-2 text-left hover:bg-maggie-clay/10 transition-colors">
                              <div className="flex items-center justify-between text-[10px] font-bold text-maggie-primary/60">
                                <span className="font-extrabold text-maggie-primary">u/{req.requester?.name}</span>
                                <span>To: {req.trip?.destination}</span>
                              </div>
                              <p className="text-xs font-extrabold text-maggie-primary leading-tight">
                                Requested: <span className="text-maggie-orange">{req.quantity || "1"}x</span> {req.itemDescription}
                              </p>
                              {req.estimatedAmount && (
                                <p className="text-[10px] text-maggie-primary/50 font-bold">Est. Price: ₹{req.estimatedAmount}</p>
                              )}
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={(e) => handleAcceptRequest(e, req._id)}
                                  className="flex-1 py-1.5 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-[10px] font-black text-maggie-primary shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] hover:shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:translate-y-[-0.5px] transition-all cursor-pointer text-center"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={(e) => handleRejectRequest(e, req._id)}
                                  className="flex-1 py-1.5 rounded-xl bg-maggie-pink border-2 border-maggie-primary text-[10px] font-black text-maggie-primary shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] hover:shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:translate-y-[-0.5px] transition-all cursor-pointer text-center"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-maggie-primary/45 font-bold">
                            No pending requests
                          </div>
                        )}
                      </div>

                      <Link
                        href="/chats"
                        onClick={() => setShowNotifications(false)}
                        className="block text-center bg-maggie-clay/40 border-t-2 border-maggie-primary py-2.5 text-[10px] font-black uppercase hover:bg-maggie-clay/70 transition-colors"
                      >
                        View Coordination Inbox
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/trip/new"
                  className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-[#aefbff] text-maggie-primary font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all"
                >
                  Post Trip
                </Link>

                {currentUser && (
                  <Link
                    href={`/profile/${currentUser._id}`}
                    className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-white text-maggie-primary font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all"
                  >
                    Profile
                  </Link>
                )}

                <button
                  onClick={handleSignOut}
                  className="p-2.5 rounded-full border-2 border-maggie-primary bg-maggie-pink hover:bg-maggie-pink/80 text-maggie-primary shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all cursor-pointer"
                  title="Log Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-white/10 hover:bg-white/30 text-maggie-primary font-black text-xs uppercase tracking-wider transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-full border-2 border-maggie-primary bg-[#aefbff] text-maggie-primary font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(3,89,77,1)] transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── MOBILE: Hamburger icon + notification badge ── */}
          <div className="flex sm:hidden items-center gap-2">
            {showAuthNav && pendingRequests && pendingRequests.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-maggie-orange text-white text-[10px] font-black border border-maggie-primary animate-pulse">
                {pendingRequests.length}
              </span>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full border-2 border-maggie-primary bg-white text-maggie-primary shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 pt-[65px]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          {/* Drawer panel */}
          <div className="relative bg-maggie-mint border-b-2 border-maggie-primary px-5 py-6 flex flex-col gap-3 shadow-[0_8px_24px_rgba(3,89,77,0.15)]">
            {/* Always-visible links */}
            <Link
              href="/faq"
              onClick={closeMobileMenu}
              className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-maggie-purple text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all"
            >
              FAQs
            </Link>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-maggie-pink text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all"
            >
              About
            </Link>

            {showAuthNav ? (
              <>
                <Link
                  href="/chats"
                  onClick={closeMobileMenu}
                  className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-maggie-yellow text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all flex items-center justify-center gap-2"
                >
                  Chats
                  {pendingRequests && pendingRequests.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-maggie-orange text-white text-[10px] font-black border border-maggie-primary animate-pulse">
                      {pendingRequests.length}
                    </span>
                  )}
                </Link>
                <Link
                  href="/trip/new"
                  onClick={closeMobileMenu}
                  className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-[#aefbff] text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all"
                >
                  Post Trip
                </Link>
                {currentUser && (
                  <Link
                    href={`/profile/${currentUser._id}`}
                    onClick={closeMobileMenu}
                    className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-white text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={() => { closeMobileMenu(); handleSignOut(); }}
                  className="w-full px-5 py-3 rounded-full border-2 border-maggie-primary bg-maggie-pink text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-white/60 text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="w-full text-center px-5 py-3 rounded-full border-2 border-maggie-primary bg-[#aefbff] text-maggie-primary font-black text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
