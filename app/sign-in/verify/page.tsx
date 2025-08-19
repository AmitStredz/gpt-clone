"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"

function VerifyEmailContent() {
  const params = useSearchParams()
  const email = params.get("email") || ""
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [code, setCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email) router.replace("/sign-in")
  }, [email, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    try {
      setSubmitting(true)
      setError(null)
      const res = await signIn.attemptFirstFactor({ strategy: "email_code", code })
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId })
        router.replace("/")
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Invalid code")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <div className="text-[22px] font-medium tracking-tight">ChatGPT</div>
      </div>
      <div className="max-w-xl mx-auto px-6">
        <h1 className="text-[40px] leading-tight font-medium text-center mb-6">Enter code</h1>
        <div className="text-center text-[14px] text-[#6b7280] mb-6">We sent a 6‑digit code to {email}</div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            className="w-full h-12 px-5 rounded-full bg-white border border-[#c7c7f5] focus:border-[#5b5bd6] outline-none focus:ring-2 focus:ring-[#5b5bd6] text-[16px] tracking-widest text-center"
            placeholder="••••••"
          />
          <button type="submit" disabled={submitting} className="w-full h-12 rounded-full bg-black text-white text-[16px] font-medium disabled:opacity-60">
            {submitting ? "Verifying…" : "Verify"}
          </button>
          {error && <div className="text-center text-[14px] text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

