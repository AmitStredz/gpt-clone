// app/signup/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useUser } from "@clerk/nextjs"

import { FaGoogle, FaApple } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { FaMicrosoft } from "react-icons/fa";

export default function Signup() {
  const router = useRouter()
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { isSignedIn } = useUser();
  
  useEffect(() => {
    if (isSignedIn) {
      router.push("/"); // redirect to home if already signed in
    }
  }, [isSignedIn, router]);

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    try {
      setSubmitting(true)
      setError(null)
      const result = await signIn.create({ identifier: email })

      if (!result.supportedFirstFactors) {
        throw new Error("No authentication factors available")
      }

      const emailFactor = result.supportedFirstFactors.find(
        factor => factor.strategy === "email_code"
      ) as { emailAddressId: string }

      if (!emailFactor) {
        throw new Error("Email authentication not supported")
      }

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      })

      router.push(`/sign-in/verify?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Unable to continue with email")
    } finally {
      setSubmitting(false)
    }
  }

  const oauth = async (
    strategy: "oauth_google" | "oauth_microsoft" | "oauth_apple"
  ) => {
    if (!isLoaded || !signIn) return
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] px-4">
      {/* Logo */}
      <div className="absolute top-5 left-5 font-semibold text-lg">ChatGPT</div>

      {/* Card */}
      <div className="w-full max-w-md text-center text-black">
        <h1 className="text-2xl font-semibold text-black mb-6">
          Create an account
        </h1>

        {/* Email Input */}
        <form onSubmit={handleEmailContinue} className="space-y-4">

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#e2e2e2] rounded-full px-4 py-3 text-sm outline-none mb-4 focus:ring-1 focus:ring-[#3b82f6]"
        />

        {/* Continue Button */}
        <button
        type="submit"
          disabled={submitting}
          className="w-full bg-black text-white font-medium py-3 rounded-full mb-4 hover:bg-neutral-800 transition"
        >
           {submitting ? "Continuing…" : "Continue"}
        </button>
        </form>

        {/* Already have account */}
        <p className="text-sm text-gray-600 mb-6">
          Already have an account?{" "}
          <a href="/sign-up" className="text-[#3b82f6] hover:underline">
            Log in
          </a>
        </p>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-sm text-gray-500">OR</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Social Logins */}
        <div className="space-y-3">
          <button className="w-full flex items-center border border-[#e2e2e2] rounded-full p-3 px-6 hover:bg-gray-100 transition"
          type="button"
           onClick={() => router.push("/sign-in/phone")}>
            <FiPhone className="mr-2 text-lg" /> Continue with phone
          </button>

          <button className="w-full flex items-center border border-[#e2e2e2] rounded-full p-3 px-6 hover:bg-gray-100 transition"
           onClick={() => oauth("oauth_google")}
           type="button">
            <FaGoogle className="mr-2 text-lg text-[#DB4437]" /> Continue with Google
          </button>

          <button className="w-full flex items-center border border-[#e2e2e2] rounded-full p-3 px-6 hover:bg-gray-100 transition"
           onClick={() => oauth("oauth_microsoft")}>
            <FaMicrosoft className="mr-2 text-lg text-[#00A4EF]" /> Continue with Microsoft Account
          </button>

          <button className="w-full flex items-center border border-[#e2e2e2] rounded-full p-3 px-6 hover:bg-gray-100 transition"
           onClick={() => oauth("oauth_apple")}>
            <FaApple className="mr-2 text-lg" /> Continue with Apple
          </button>
        </div>
        {error && (
          <div className="mt-4 text-center text-[14px] text-red-600">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-center mt-10 space-x-6 text-sm text-gray-500">
          <a href="#" className="hover:underline">
            Terms of Use
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
