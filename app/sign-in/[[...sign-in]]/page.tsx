"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"
import Link from "next/link"

export default function Page() {
  const router = useRouter()
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    try {
      setSubmitting(true)
      setError(null)
      await signIn.create({ identifier: email })
      await signIn.prepareFirstFactor({ strategy: "email_code" })
      router.push(`/sign-in/verify?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Unable to continue with email")
    } finally {
      setSubmitting(false)
    }
  }

  const oauth = async (strategy: "oauth_google" | "oauth_microsoft" | "oauth_apple") => {
    if (!isLoaded || !signIn) return
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top-left brand */}
      <div className="p-6">
        <div className="text-[22px] font-medium tracking-tight">ChatGPT</div>
      </div>

      {/* Centered auth content */}
      <div className="max-w-[560px] mx-auto px-6 -mt-6 flex flex-col items-stretch justify-center min-h-[calc(100vh-96px)]">
        <h1 className="text-[40px] leading-tight font-medium text-center mb-6 tracking-tight">Welcome back</h1>

        <form onSubmit={handleEmailContinue} className="space-y-4">
          <label className="block text-[14px] text-[#6b7280] mb-1">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-5 rounded-full bg-white border border-[#C7C7F5] focus:border-[#5b5bd6] outline-none focus:ring-2 focus:ring-[#5b5bd6] text-[16px]"
            placeholder=""
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-full bg-black text-white text-[16px] font-medium disabled:opacity-60"
          >
            {submitting ? "Continuing…" : "Continue"}
          </button>
        </form>

        <div className="text-center text-[14px] text-[#6b7280] mt-3">
          Don&apos;t have an account? <Link href="/sign-up" className="text-[#4f46e5] hover:underline">Sign up</Link>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-[#e5e7eb]" />
          <div className="mx-4 text-[13px] text-[#6b7280]">OR</div>
          <div className="flex-1 h-px bg-[#e5e7eb]" />
        </div>

        <div className="space-y-3">
          {/* Continue with phone (route to default Clerk page for phone if configured) */}
          <button
            type="button"
            onClick={() => router.push("/sign-in/phone")}
            className="w-full h-12 rounded-2xl border border-[#e5e7eb] hover:bg-[#f9fafb] text-[16px] flex items-center justify-start px-5"
          >
            <span className="mr-3">☎️</span>
            <span>Continue with phone</span>
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={() => oauth("oauth_google")}
            className="w-full h-12 rounded-2xl border border-[#e5e7eb] hover:bg-[#f9fafb] text-[16px] flex items-center justify-start px-5"
          >
            <GoogleIcon className="mr-3" />
            <span>Continue with Google</span>
          </button>

          {/* Microsoft */}
          <button
            type="button"
            onClick={() => oauth("oauth_microsoft")}
            className="w-full h-12 rounded-2xl border border-[#e5e7eb] hover:bg-[#f9fafb] text-[16px] flex items-center justify-start px-5"
          >
            <MicrosoftIcon className="mr-3" />
            <span>Continue with Microsoft Account</span>
          </button>

          {/* Apple */}
          <button
            type="button"
            onClick={() => oauth("oauth_apple")}
            className="w-full h-12 rounded-2xl border border-[#e5e7eb] hover:bg-[#f9fafb] text-[16px] flex items-center justify-start px-5"
          >
            <AppleIcon className="mr-3" />
            <span>Continue with Apple</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 text-center text-[14px] text-red-600">{error}</div>
        )}
      </div>
    </div>
  )
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 18.4-7.3 19.8-16.8.2-1 .3-2 .3-3.2 0-1.1-.1-1.9-.5-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.4 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.9-5.3l-6.4-5.2C29.3 35.8 26.8 36 24 36c-5.4 0-9.8-3.1-11.9-7.6l-6.6 5.1C8.3 39.5 15.6 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.3-4 6-7.4 7.3l6.4 5.2C36.9 38.7 40 32.8 40 26c0-1.1-.1-1.9-.4-3.5z"/>
    </svg>
  )
}

function MicrosoftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect width="10" height="10" x="1" y="1" fill="#F25022"/>
      <rect width="10" height="10" x="13" y="1" fill="#7FBA00"/>
      <rect width="10" height="10" x="1" y="13" fill="#00A4EF"/>
      <rect width="10" height="10" x="13" y="13" fill="#FFB900"/>
    </svg>
  )
}

function AppleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.456 2.22-1.2 3.03-.744.84-1.98 1.53-3.18 1.44-.096-1.1.42-2.28 1.164-3.06.78-.9 2.1-1.56 3.216-1.41zM21.12 17.25c-.6 1.44-1.38 2.85-2.49 4.14-1.02 1.17-2.28 2.61-3.96 2.61-1.65 0-2.07-.84-3.87-.84-1.83 0-2.28.81-3.9.87-1.68.06-2.97-1.35-3.99-2.52C1.44 20.7.36 18.09.36 15.66c0-2.73 1.47-4.2 3.39-5.28 1.02-.57 2.31-.99 3.51-1.02 1.65-.06 3.21.93 3.87.93.66 0 2.13-1.14 3.6-1.02 1.23.06 2.52.48 3.54 1.26-1.02 1.2-1.77 2.19-1.71 3.78.06 1.89 1.08 3 2.16 3.96.66.6 1.41 1.14 2.22 1.41z" />
    </svg>
  )
}

