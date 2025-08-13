"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PenSquare, Search, BookOpen, Sparkles, Users } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentChat: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

const chatHistory = [
  "Greeting exchange",
  "Assignment Breakdown ChatGPT...",
  "Formatted developer guidelines",
  "GitHub token setup",
  "NPM dependency conflict",
  "Resume analysis and improvement",
  "Cover letter revision",
  "Convert salary to INR",
  "Stash and switch branches",
  "Chrome extension alarm test",
  "Create branch from CL",
]

export function Sidebar({ isOpen, onToggle, currentChat, onChatSelect, onNewChat }: SidebarProps) {
  if (!isOpen) return null

  return (
    <div className="w-[260px] bg-[#171717] border-r border-[#2f2f2f] flex flex-col h-full">
      {/* Top Section */}
      <div className="p-2 space-y-1 flex-shrink-0">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-[#2f2f2f] h-11 px-3"
          onClick={onNewChat}
        >
          <PenSquare className="w-4 h-4 mr-3" />
          New chat
        </Button>

        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#2f2f2f] h-11 px-3">
          <Search className="w-4 h-4 mr-3" />
          Search chats
        </Button>

        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#2f2f2f] h-11 px-3">
          <BookOpen className="w-4 h-4 mr-3" />
          Library
        </Button>

        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#2f2f2f] h-11 px-3">
          <Sparkles className="w-4 h-4 mr-3" />
          Sora
        </Button>

        <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#2f2f2f] h-11 px-3">
          <Users className="w-4 h-4 mr-3" />
          GPTs
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 px-2 min-h-0">
        <div className="text-xs text-[#8e8ea0] font-medium mb-2 px-3">Chats</div>
        <ScrollArea className="h-full">
          <div className="space-y-1 pb-4">
            {chatHistory.map((chat, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start text-left text-white hover:bg-[#2f2f2f] h-11 px-3 text-sm font-normal ${
                  currentChat === chat ? "bg-[#2f2f2f]" : ""
                }`}
                onClick={() => onChatSelect(chat)}
              >
                <span className="truncate">{chat}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom User Section */}
      <div className="p-2 border-t border-[#2f2f2f] flex-shrink-0">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" className="w-full justify-start text-white hover:bg-[#2f2f2f] h-11 px-3">
              <div className="w-6 h-6 bg-[#10a37f] rounded-full flex items-center justify-center mr-3 text-xs font-medium">
                ?
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm">Sign in to save chats</div>
                <div className="text-xs text-[#8e8ea0]">Click to continue</div>
              </div>
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="w-full flex items-center justify-between px-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </div>
  )
}
