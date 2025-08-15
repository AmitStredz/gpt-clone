"use client"

import { Button } from "@/components/ui/button"
import { PanelLeft, ChevronDown, Share, Settings } from "lucide-react"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <div className="h-14 border-b border-[#2f2f2f] flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#2f2f2f] p-2" onClick={onToggleSidebar}>
          <PanelLeft className="w-4 h-4" />
        </Button>

        <Button variant="ghost" className="text-white hover:bg-[#2f2f2f] h-8 px-3 text-sm font-medium cursor-pointer">
          ChatGPT
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <SignedOut>
          <Link href="/sign-in">
            <Button variant="ghost" className="text-white hover:bg-[#2f2f2f] h-8 px-4 text-sm font-medium cursor-pointer">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-[#6366f1] hover:bg-[#5855eb] text-white h-8 px-4 text-sm font-medium cursor-pointer">Sign up</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2f2f2f] p-2 cursor-pointer">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2f2f2f] p-2 cursor-pointer">
            <Settings className="w-4 h-4" />
          </Button>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  )
}
