"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import { useConfirm } from "../../components/ModalProvider";
import { 
  Send, 
  CreditCard, 
  QrCode, 
  CheckCircle, 
  Truck, 
  Star, 
  AlertCircle,
  X
} from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { confirm, showAlert } = useConfirm();

  // Convex Hooks
  const currentUser = useQuery(api.users.currentUser);
  const chat = useQuery(api.chats.getChat, { chatId });
  const messages = useQuery(api.messages.getMessages, { chatId });

  const sendMessage = useMutation(api.messages.sendMessage);
  const markAdvancePaid = useMutation(api.chats.markAdvancePaid);
  const markDelivered = useMutation(api.chats.markDelivered);
  const confirmDelivery = useMutation(api.chats.confirmDelivery);
  const submitRating = useMutation(api.ratings.submitRating);
  const updateEstimatedAmount = useMutation(api.chats.updateEstimatedAmount);

  // Local State
  const [inputMsg, setInputMsg] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPriceInput, setNewPriceInput] = useState("");
  
  // Rating form state
  const [stars, setStars] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!chat || !currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-maggie-bg text-maggie-primary">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const isGoer = currentUser._id === chat.goerId;
  const otherPartyName = isGoer ? chat.requester?.name : chat.goer?.name;
  
  // UPI details
  const goerName = chat.goer?.name || "Goer";
  const goerUpi = chat.goer?.upiId || "upi@okaxis"; // Fallback UPI for demo
  const itemEstPrice = chat.estimatedAmount !== undefined ? chat.estimatedAmount : 200;
  const advanceAmount = Math.round(itemEstPrice * 0.5);

  const upiUrl = `upi://pay?pa=${encodeURIComponent(goerUpi)}&pn=${encodeURIComponent(goerName)}&am=${advanceAmount}&cu=INR&tn=CampusCarry+Advance`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}`;

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newPriceInput);
    if (isNaN(amount) || amount <= 0) {
      await showAlert("Please enter a valid amount");
      return;
    }
    try {
      await updateEstimatedAmount({ chatId, amount });
      setIsEditingPrice(false);
    } catch (err: any) {
      console.error(err);
      await showAlert(err.message || "Failed to update price");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    try {
      await sendMessage({ chatId, content: inputMsg });
      setInputMsg("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = async () => {
    const isConfirmed = await confirm("Have you sent the UPI payment? Click OK to notify the Goer.");
    if (isConfirmed) {
      await markAdvancePaid({ chatId });
    }
  };

  const handleMarkDelivered = async () => {
    const isConfirmed = await confirm("Mark this errand as delivered to the hostel?");
    if (isConfirmed) {
      await markDelivered({ chatId });
    }
  };

  const handleConfirmDelivery = async () => {
    const isConfirmed = await confirm("Confirm that you have received your items and paid the rest? This will open the rating form.");
    if (isConfirmed) {
      await confirmDelivery({ chatId });
      setShowRatingModal(true);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRatingLoading(true);
    setRatingError(null);
    try {
      await submitRating({
        chatId,
        toUserId: isGoer ? chat.requesterId : chat.goerId,
        stars,
        comment: ratingComment ? ratingComment : undefined,
        role: isGoer ? "requester" : "goer",
      });
      setRatingSubmitted(true);
      setTimeout(() => {
        setShowRatingModal(false);
      }, 1500);
    } catch (err: any) {
      setRatingError(err.message || "Failed to submit rating.");
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-maggie-bg text-maggie-primary font-bold">
      <Header />

      {/* 1. Pinned Status Banner */}
      <div className="bg-maggie-clay border-b-2 border-maggie-primary px-4 py-3 sm:px-6 lg:px-8 shadow-[0_2px_4px_0_rgba(3,89,77,0.05)] overflow-x-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm min-w-0">
          
          {/* Status info */}
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-maggie-orange animate-pulse" />
            <div>
              <span className="text-maggie-primary/70">Errand: </span>
              <span className="font-extrabold text-maggie-primary">{chat.itemDetails || "Errand Coordination"}</span>
            </div>
          </div>

          {/* Actionable Banner Content */}
          <div className="flex flex-wrap items-center gap-2">
            {chat.paymentStatus === "pending" && (
              <div className="flex flex-wrap items-center gap-2 font-bold">
                {isEditingPrice ? (
                  <form onSubmit={handleUpdatePrice} className="flex items-center gap-2">
                    <span className="text-maggie-primary/75">Est. Price (₹):</span>
                    <input
                      type="number"
                      className="bg-white border-2 border-maggie-primary rounded-xl px-2.5 py-1 text-xs text-maggie-primary focus:outline-none w-24"
                      value={newPriceInput}
                      onChange={(e) => setNewPriceInput(e.target.value)}
                      min="1"
                      required
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 transition-all cursor-pointer text-maggie-primary font-black"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingPrice(false)}
                      className="px-3 py-1.5 rounded-xl bg-maggie-clay border-2 border-maggie-primary/30 text-xs font-bold cursor-pointer text-maggie-primary"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    {!isGoer ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-maggie-orange font-black">
                          Send ₹{advanceAmount} (50% of ₹{itemEstPrice})
                        </span>
                        <button
                          onClick={() => {
                            setNewPriceInput(itemEstPrice.toString());
                            setIsEditingPrice(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border-2 border-maggie-primary bg-white hover:bg-zinc-50 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 transition-all cursor-pointer text-maggie-primary"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={() => setShowQR(!showQR)}
                          className="px-3 py-1.5 rounded-xl border-2 border-maggie-primary bg-white hover:bg-zinc-50 flex items-center gap-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 transition-all cursor-pointer text-maggie-primary"
                        >
                          <QrCode className="h-4 w-4" /> {showQR ? "Hide QR" : "Show QR"}
                        </button>
                        <a
                          href={upiUrl}
                          className="px-3 py-1.5 rounded-xl border-2 border-maggie-primary bg-maggie-yellow hover:bg-maggie-yellow/90 flex items-center gap-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 transition-all text-maggie-primary"
                        >
                          <CreditCard className="h-4 w-4" /> Pay UPI
                        </a>
                        <button
                          onClick={handleMarkPaid}
                          className="px-3 py-1.5 rounded-xl border-2 border-maggie-primary bg-maggie-mint hover:bg-maggie-mint/90 flex items-center gap-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 transition-all cursor-pointer text-maggie-primary"
                        >
                          Mark Paid
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-maggie-orange font-black">
                          Awaiting ₹{advanceAmount} advance (50% of ₹{itemEstPrice})
                        </span>
                        <button
                          onClick={() => {
                            setNewPriceInput(itemEstPrice.toString());
                            setIsEditingPrice(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl border-2 border-maggie-primary bg-white hover:bg-zinc-50 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] hover:-translate-y-0.5 transition-all cursor-pointer text-maggie-primary"
                        >
                          Edit Price
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {chat.paymentStatus === "advance_paid" && chat.deliveryStatus === "pending" && (
              <>
                {isGoer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-maggie-primary">Advance Received! Coordinate items.</span>
                    <button
                      onClick={handleMarkDelivered}
                      className="px-3 py-1.5 rounded-xl border-2 border-maggie-primary bg-maggie-mint hover:bg-maggie-mint/90 flex items-center gap-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]"
                    >
                      <Truck className="h-4 w-4" /> Mark Delivered
                    </button>
                  </div>
                ) : (
                  <span className="text-maggie-primary">Advance Paid! Goer is shopping/coordinating.</span>
                )}
              </>
            )}

            {chat.deliveryStatus === "delivered" && (
              <>
                {!isGoer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-maggie-orange font-extrabold">Items Delivered! Pay rest & confirm.</span>
                    <button
                      onClick={handleConfirmDelivery}
                      className="px-3 py-1.5 rounded-xl border-2 border-maggie-primary bg-maggie-mint hover:bg-maggie-mint/90 flex items-center gap-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]"
                    >
                      Confirm Delivery
                    </button>
                  </div>
                ) : (
                  <span className="text-maggie-primary">Items marked delivered. Awaiting confirmation.</span>
                )}
              </>
            )}

            {chat.deliveryStatus === "confirmed" && (
              <div className="flex items-center gap-2">
                <span className="text-maggie-primary flex items-center gap-1 font-extrabold">
                  <CheckCircle className="h-4.5 w-4.5 text-maggie-primary fill-maggie-mint" /> Completed!
                </span>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-3 py-1.5 rounded-xl border-2 border-maggie-primary bg-maggie-yellow hover:bg-maggie-yellow/90 flex items-center gap-1 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]"
                >
                  <Star className="h-4 w-4 fill-maggie-primary text-maggie-primary" /> Rate Transaction
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 2. QR Code Popover */}
      {showQR && chat.paymentStatus === "pending" && (
        <div className="bg-white border-b-2 border-maggie-primary p-6 flex items-center justify-center flex-col text-center">
          <p className="text-xs text-maggie-primary/70 mb-3">Scan QR to pay ₹{advanceAmount} advance to {goerName}</p>
          <div className="bg-white p-3 rounded-2xl border-2 border-maggie-primary shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] inline-block">
            <img src={qrCodeUrl} alt="UPI QR Code" className="h-32 w-32" />
          </div>
          <p className="text-xs font-extrabold text-maggie-primary mt-3">UPI ID: {goerUpi}</p>
        </div>
      )}

      {/* 3. Message Stream List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-4 max-w-7xl mx-auto w-full">
        {messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser._id;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] border-2 border-maggie-primary rounded-[20px] px-4 py-3 text-sm shadow-[2.5px_2.5px_0px_0px_rgba(3,89,77,1)] ${
                  isMine 
                    ? "bg-maggie-mint text-maggie-primary rounded-tr-none" 
                    : "bg-white text-maggie-primary rounded-tl-none"
                }`}>
                  <p className="font-semibold">{msg.content}</p>
                </div>
                <span className="text-[10px] text-maggie-primary/50 mt-1.5 px-1 font-bold">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-maggie-primary/50">
            <p className="text-sm">No messages yet. Send a message to coordinate hostel drop-off!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Chat Input Bar */}
      <form onSubmit={handleSend} className="bg-maggie-clay border-t-2 border-maggie-primary p-4">
        <div className="max-w-7xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder={`Message ${otherPartyName}...`}
            className="flex-1 maggie-input"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="h-11 w-11 rounded-xl bg-maggie-orange border-2 border-maggie-primary text-white flex items-center justify-center transition-all disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(3,89,77,1)] active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_rgba(3,89,77,1)]"
          >
            <Send className="h-4.5 w-4.5 text-maggie-primary stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* 5. Rating Dialog Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] w-full max-w-md shadow-[6px_6px_0px_0px_rgba(3,89,77,1)] relative text-maggie-primary">
            
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-maggie-primary hover:text-maggie-orange transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black mb-1">Rate {otherPartyName}</h3>
            <p className="text-xs font-bold text-maggie-primary/65 mb-6">
              Help keep our hostel coordinate runs safe and reliable.
            </p>

            {ratingSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-maggie-primary fill-maggie-mint mx-auto mb-3" />
                <p className="text-maggie-primary font-black text-sm">Rating Submitted!</p>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4">
                {ratingError && (
                  <div className="p-3 bg-maggie-pink/30 border-2 border-maggie-primary rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                    <span>{ratingError}</span>
                  </div>
                )}

                {/* Stars Rating Selector */}
                <div>
                  <label className="block text-xs font-bold mb-2">Transaction rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setStars(val)}
                        className="p-1 rounded transition-colors"
                      >
                        <Star className={`h-8 w-8 ${val <= stars ? "fill-maggie-primary text-maggie-primary" : "text-zinc-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold mb-1">Comment (Optional)</label>
                  <textarea
                    placeholder="e.g. Prompt delivery, items exactly as requested, great coordination!"
                    rows={3}
                    className="w-full maggie-input"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="w-full maggie-button bg-maggie-mint text-maggie-primary font-bold"
                >
                  {ratingLoading ? (
                    <div className="h-4 w-4 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    "Submit Rating"
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
