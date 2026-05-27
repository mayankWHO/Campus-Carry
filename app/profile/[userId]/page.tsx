"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import { useConfirm } from "../../components/ModalProvider";
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Calendar, 
  Award, 
  Edit3, 
  Save, 
  CheckCircle,
  Truck,
  ShoppingBag,
  MessageSquare
} from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as any;
  const { showAlert } = useConfirm();

  // Convex Hooks
  const currentUser = useQuery(api.users.currentUser);
  const profile = useQuery(api.users.getUser, { userId });
  const updateProfile = useMutation(api.users.updateProfile);

  // Form State
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isOwnProfile = currentUser && currentUser._id === userId;

  useEffect(() => {
    if (profile) {
      setUpiId(profile.upiId || "");
      setName(profile.name || "");
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        upiId: upiId ? upiId : undefined,
        name: name ? name : undefined,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      await showAlert("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile || !currentUser) {
    return (
      <div className="flex min-h-screen flex-col bg-maggie-bg text-maggie-primary">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Badge calculations
  const badges = [];
  if ((profile.totalTripsAsGoer ?? 0) >= 5) {
    badges.push({ name: "Veteran Goer", desc: "Completed 5+ trips as Goer" });
  }
  if ((profile.averageRating || 5.0) >= 4.8 && (profile.totalTripsAsGoer ?? 0) >= 3) {
    badges.push({ name: "Super Goer", desc: "Highly rated on 3+ trips" });
  }
  if ((profile.totalTripsAsRequester ?? 0) >= 5) {
    badges.push({ name: "Active Requester", desc: "Coordinated 5+ errand deliveries" });
  }
  if (profile.verificationStatus === "verified") {
    badges.push({ name: "Verified Student", desc: "SheerID Student verification complete" });
  }

  return (
    <div className="flex flex-col min-h-screen bg-maggie-bg text-maggie-primary">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="bg-white border-2 border-maggie-primary p-8 rounded-[24px] mb-8 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(3,89,77,1)]">
          
          <div className="absolute top-0 right-0 bg-maggie-yellow border-l-2 border-b-2 border-maggie-primary px-4 py-1.5 rounded-bl-2xl text-xs text-maggie-primary font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 fill-maggie-mint text-maggie-primary" />
            {profile.verificationStatus}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-maggie-mint border-2 border-maggie-primary flex items-center justify-center font-bold text-2xl text-maggie-primary shadow-[3px_3px_0px_0px_rgba(3,89,77,1)]">
              {profile.name?.[0] || "U"}
            </div>

            {/* User Meta */}
            <div className="text-center md:text-left flex-1 space-y-2 font-bold">
              {isEditing ? (
                <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    required
                    className="bg-white border-2 border-maggie-primary rounded-xl px-3 py-1.5 text-sm text-maggie-primary focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                  />
                  <input
                    type="text"
                    placeholder="UPI ID (e.g. rohan@okaxis)"
                    className="bg-white border-2 border-maggie-primary rounded-xl px-3 py-1.5 text-sm text-maggie-primary focus:outline-none"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    disabled={saving}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-3 py-2 rounded-xl bg-maggie-mint border-2 border-maggie-primary text-xs font-bold text-maggie-primary shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]"
                    >
                      <Save className="h-3.5 w-3.5" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 rounded-xl bg-maggie-clay border-2 border-maggie-primary/30 text-xs font-bold text-maggie-primary/70"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-maggie-primary uppercase tracking-tight">{profile.name}</h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-lg bg-maggie-clay border-2 border-maggie-primary/20 hover:border-maggie-primary text-maggie-primary/60 hover:text-maggie-primary transition-all"
                      title="Edit Profile"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              <p className="text-sm text-maggie-primary/75 flex items-center justify-center md:justify-start gap-1">
                <MapPin className="h-4 w-4 text-maggie-orange" />
                {profile.college || "Awaiting verification"}
              </p>

              <p className="text-xs text-maggie-primary/50 flex items-center justify-center md:justify-start gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(profile.createdAt ?? Date.now()).toLocaleDateString([], { month: "long", year: "numeric" })}
              </p>

              {/* UPI ID display */}
              {isOwnProfile && !isEditing && (
                <p className="text-xs text-maggie-primary/80">
                  <span className="font-extrabold text-maggie-primary">UPI Address:</span> {profile.upiId || <span className="text-maggie-orange italic font-bold">Configure UPI in settings to receive payments</span>}
                </p>
              )}
            </div>

            {/* Profile metrics */}
            <div className="flex items-center gap-6 py-4 px-6 rounded-2xl bg-maggie-clay/40 border-2 border-maggie-primary/15 font-bold">
              <div className="text-center">
                <div className="flex items-center justify-center gap-0.5 text-maggie-primary font-black text-lg">
                  <Star className="h-4.5 w-4.5 fill-maggie-primary text-maggie-primary" />
                  {profile.averageRating || "5.0"}
                </div>
                <span className="text-[10px] text-maggie-primary/50 uppercase tracking-wider block mt-1.5">Rating</span>
              </div>
              <div className="h-8 w-px bg-maggie-primary/10" />
              <div className="text-center">
                <div className="text-maggie-primary font-black text-lg flex items-center justify-center gap-1">
                  <Truck className="h-4 w-4 text-maggie-orange" />
                  {profile.totalTripsAsGoer || 0}
                </div>
                <span className="text-[10px] text-maggie-primary/50 uppercase tracking-wider block mt-1">Runs</span>
              </div>
              <div className="h-8 w-px bg-maggie-primary/10" />
              <div className="text-center">
                <div className="text-maggie-primary font-black text-lg flex items-center justify-center gap-1">
                  <ShoppingBag className="h-4 w-4 text-maggie-orange" />
                  {profile.totalTripsAsRequester || 0}
                </div>
                <span className="text-[10px] text-maggie-primary/50 uppercase tracking-wider block mt-1">Requests</span>
              </div>
            </div>

          </div>

          {saveSuccess && (
            <div className="mt-4 p-2 bg-maggie-mint/20 border-2 border-maggie-primary text-maggie-primary font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
              <CheckCircle className="h-4 w-4 fill-maggie-primary text-white" /> Profile settings updated successfully!
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Badges Column */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] text-maggie-primary">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Earned Badges
              </h3>
              
              {badges.length > 0 ? (
                <div className="space-y-3">
                  {badges.map((badge) => (
                    <div key={badge.name} className="p-3 rounded-xl bg-maggie-clay/35 border-2 border-maggie-primary/15 flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-maggie-yellow border-2 border-maggie-primary flex items-center justify-center text-maggie-primary shrink-0 shadow-[1px_1px_0px_0px_rgba(3,89,77,1)]">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-maggie-primary">{badge.name}</h4>
                        <p className="text-[10px] font-bold text-maggie-primary/65">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-bold text-maggie-primary/50 text-center py-4">No badges earned yet.</p>
              )}
            </div>
          </div>

          {/* Ratings History */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border-2 border-maggie-primary p-6 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(3,89,77,1)] text-maggie-primary">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Peer Reviews ({profile.ratings?.length || 0})
              </h3>

              <div className="space-y-4">
                {profile.ratings && profile.ratings.length > 0 ? (
                  profile.ratings.map((rating) => (
                    <div key={rating._id} className="p-4 rounded-xl bg-maggie-clay/30 border-2 border-maggie-primary/15 font-bold">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-maggie-mint border border-maggie-primary text-maggie-primary font-black px-2 py-0.5 rounded shadow-[1px_1px_0px_0px_rgba(3,89,77,1)] uppercase">
                            As {rating.role}
                          </span>
                          <span className="text-[10px] text-maggie-primary/50">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5 text-maggie-primary">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`h-3.5 w-3.5 ${idx < rating.stars ? "fill-maggie-primary text-maggie-primary" : "text-zinc-200"}`} 
                            />
                          ))}
                        </div>
                      </div>

                      {rating.comment ? (
                        <p className="text-sm font-semibold text-maggie-primary/85 leading-relaxed italic mt-2">
                          "{rating.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-maggie-primary/45 italic mt-1 font-bold">No comment left</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-bold text-maggie-primary/50 text-center py-8">No reviews received yet.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
