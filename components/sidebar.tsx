"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PanelLeft, PenSquare, Search, BookOpen, Sparkles, Users, MoreHorizontal, PencilLine, Trash2 } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  currentChat: string | null
  onChatSelect: (chatId: string) => void
  onNewChat: () => void
}

type ConversationItem = { id: string; title: string }

export function Sidebar({ isOpen, onToggle, currentChat, onChatSelect, onNewChat }: SidebarProps) {
  const [items, setItems] = useState<ConversationItem[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useIsMobile()

  const loadConversations = () => {
    if (isOpen) {
      fetch('/api/conversations')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => setItems((data?.conversations ?? []).map((c: any) => ({ id: c.id, title: c.title }))))
        .catch(() => setItems([]))
    }
  }
  useEffect(() => { loadConversations() }, [isOpen, currentChat])

  const content = (
    <div
      className={`${isOpen ? 'w-[260px] bg-[#171717]' : 'w-[72px]'}  border-r border-[#3e3e3fcd] flex flex-col h-full transition-all duration-200`}
      onMouseEnter={() => !isOpen && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo and Toggle */}
      <div className="flex justify-between items-center p-2">
        <div className={`relative ${isOpen ? '' : 'flex justify-center w-full'}`}>
          <Button 
            variant="ghost" 
            className="p-3 hover:bg-[#2A2A2A] rounded-lg transition-all duration-200"
            onClick={() => isHovered ? onToggle() : undefined}
          >
            {isHovered && !isOpen ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <img src="/gpt-logo.svg" className="w-5 h-5"/>
            )}
          </Button>
        </div>
        {isOpen && (
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#2A2A2A] p-2 rounded-lg" onClick={onToggle}>
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Top Section */}
      <div className="px-2 flex flex-col flex-shrink-0 ">
        <Button
          variant="ghost"
          className={`w-full text-[14px] text-white hover:bg-[#2A2A2A] rounded-lg px-3 cursor-pointer [font-weight:var(--font-weight-sidebar-nav)] ${
            isOpen ? 'justify-start' : 'justify-center'
          }`}
          onClick={onNewChat}
        >
          <PenSquare className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="ml-3">New chat</span>}
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full text-[14px] text-white hover:bg-[#2A2A2A] rounded-lg px-3 cursor-pointer [font-weight:var(--font-weight-sidebar-nav)] ${
            isOpen ? 'justify-start' : 'justify-center'
          }`}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="ml-3">Search chats</span>}
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full text-[14px] text-white hover:bg-[#2A2A2A] rounded-lg px-3 cursor-pointer [font-weight:var(--font-weight-sidebar-nav)] ${
            isOpen ? 'justify-start' : 'justify-center'
          }`}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="ml-3">Library</span>}
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full text-[14px] text-white hover:bg-[#2A2A2A] rounded-lg px-3 [font-weight:var(--font-weight-sidebar-nav)] ${
            isOpen ? 'justify-start' : 'justify-center'
          }`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="ml-3">Sora</span>}
        </Button>

        <Button 
          variant="ghost" 
          className={`w-full text-[14px] text-white hover:bg-[#2A2A2A] rounded-lg px-3 [font-weight:var(--font-weight-sidebar-nav)] ${
            isOpen ? 'justify-start' : 'justify-center'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          {isOpen && <span className="ml-3">GPTs</span>}
        </Button>
      </div>

      {/* Chat History and User Section - Only show when sidebar is expanded */}
      {isOpen && (
        <>
          <div className="flex-1 px-2 min-h-0 mt-4">
            <div className="text-xs text-[#8e8ea0] [font-weight:var(--font-weight-sidebar-label)] mb-2 px-3">Chats</div>
            <ScrollArea className="h-full">
              <div className="space-y-1 pb-4">
                {items.map((c) => (
                  <div key={c.id} className="group flex items-center justtify-between">
                    <Link href={`/chat/${c.id}`} className="flex-1 max-w-[200px]" onClick={(e) => { e.preventDefault(); onChatSelect(c.id); if (isMobile && isOpen) onToggle() }}>
                      <Button
                        variant="ghost"
                        className={`w-full text-[14px] text-white hover:bg-[#2A2A2A] h-10 px-3 cursor-pointer rounded-lg justify-start [font-weight:var(--font-weight-sidebar-chat)] ${
                          currentChat === c.id ? "bg-[#2A2A2A]" : ""
                        }`}
                      >
                        <span className="truncate">{c.title}</span>
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-2 cursor-pointer"
                          aria-label="Conversation actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-40 bg-[#2f2f2f]">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={async () => {
                            const next = prompt('Rename chat', c.title)
                            if (next == null) return
                            const title = next.trim()
                            if (!title) return
                            try {
                              const res = await fetch(`/api/conversations/${c.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title })
                              })
                              if (res.ok) {
                                setItems(prev => prev.map(it => it.id === c.id ? { ...it, title } : it))
                              }
                            } catch {}
                          }}
                        >
                          <PencilLine className="w-4 h-4" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 cursor-pointer"
                          // variant="destructive"
                          onClick={async () => {
                            if (!confirm('Delete this chat? This cannot be undone.')) return
                            try {
                              const res = await fetch(`/api/conversations/${c.id}`, { method: 'DELETE' })
                              if (res.ok) {
                                setItems(prev => prev.filter(it => it.id !== c.id))
                                if (currentChat === c.id) {
                                  onNewChat()
                                }
                                // Soft refresh list
                                fetch('/api/conversations').catch(() => {})
                              }
                            } catch {}
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-400 cursor-pointer" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="p-2 flex-shrink-0">
            {/* <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="w-full justify-start hover:bg-[#2A2A2A] rounded-lg h-10 px-3">
                  <div className="w-7 h-7 bg-[#444654] rounded-full flex items-center justify-center text-sm font-medium text-white mr-3">
                    N
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-[14px] text-white [font-weight:var(--font-weight-sidebar-user)]">Amit Stredz</div>
                    <div className="text-xs text-[#8e8ea0] [font-weight:var(--font-weight-sidebar-user)]">Free</div>
                  </div>
                </Button>
              </SignInButton>
            </SignedOut> */}
            <SignedIn>
              <div className="w-full flex items-center justify-between">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => { if (open !== isOpen) onToggle() }}>
        <SheetContent side="left" className="w-[260px] p-0 bg-[#171717] text-white [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Mobile navigation sidebar</SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return content
}
