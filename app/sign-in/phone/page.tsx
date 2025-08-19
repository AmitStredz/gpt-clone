"use client"

import { SignIn } from "@clerk/nextjs"

export default function PhoneSignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <SignIn routing="path" path="/sign-in/phone" appearance={{ variables: { colorPrimary: "black" } }} />
    </div>
  )
}


