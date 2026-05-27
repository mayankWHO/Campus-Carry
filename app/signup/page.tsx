"use client";

import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signIn("password", { name, email, password, flow: "signUp" });
      router.push("/verify");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError("Signup failed. That email might already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-maggie-bg px-4 py-12 sm:px-6 lg:px-8 text-maggie-primary">
      <div className="w-full max-w-md bg-white border-2 border-maggie-primary p-8 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(3,89,77,1)]">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-maggie-mint border-2 border-maggie-primary text-maggie-primary shadow-[2px_2px_0px_0px_rgba(3,89,77,1)]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-maggie-primary font-display uppercase leading-none">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm font-semibold text-maggie-primary/70">
            Join CampusCarry and help peers save on trips
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-maggie-pink/30 border-2 border-maggie-primary p-4 text-sm font-bold text-maggie-primary text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-maggie-primary mb-1">
                Username
              </label>
              <input
                id="username"
                name="name"
                type="text"
                required
                className="w-full maggie-input"
                placeholder="rohan_sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-bold text-maggie-primary mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="w-full maggie-input"
                placeholder="rohan@hostel.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-maggie-primary mb-1">
                Password (min. 8 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full maggie-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-bold text-maggie-primary mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="w-full maggie-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full maggie-button bg-maggie-mint text-maggie-primary hover:bg-maggie-mint/90 font-bold"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-maggie-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  Create Account <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm font-bold text-maggie-primary/70 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-maggie-orange hover:underline font-extrabold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
