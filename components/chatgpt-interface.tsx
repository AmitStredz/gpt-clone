"use client"

import { useEffect, useMemo, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { ChatArea } from "./chat-area"
import { InputArea } from "./input-area"
import { Chat as ReactChat, useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

export function ChatGPTInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChat, setCurrentChat] = useState<string | null>(null)
  const [hydratedMessages, setHydratedMessages] = useState<any[]>([])

  const chatInstance = useMemo(() => {
    const headers = currentChat ? { 'x-conversation-id': currentChat } : undefined
    return new ReactChat({
      id: currentChat ?? undefined,
      // Default transport expects UI message stream (matches our API response)
      transport: new DefaultChatTransport({ api: '/api/chat', headers }),
    })
  }, [currentChat])

  const { messages: uiMessages, setMessages, sendMessage, status } = useChat({ chat: chatInstance })
  const [inputText, setInputText] = useState("")

  const handleNewChat = async () => {
    setMessages([])
    const res = await fetch('/api/conversations', { method: 'POST' })
    const data = await res.json().catch(() => null)
    const id = data?.id as string | undefined
    if (id) setCurrentChat(id)
  }

  // Hydrate messages after switching chats. Keep inside component to access state.
  useEffect(() => {
    const hydrate = async () => {
      if (!currentChat) {
        setHydratedMessages([])
        return
      }
      try {
        const res = await fetch(`/api/conversations/${currentChat}/messages`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const msgs = (data?.messages ?? []).map((m: any) => ({ id: m.id, role: m.role, parts: [{ type: 'text', text: m.content }] }))
        setHydratedMessages(msgs as any)
        setMessages(msgs as any)
      } catch {
        // ignore
      }
    }
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat])

  return (
    <div className="flex h-screen max-h-screen bg-[#212121] text-white overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentChat={currentChat}
        onChatSelect={(id) => {
          setCurrentChat(id)
        }}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <ChatArea
          currentChat={currentChat}
          messages={(uiMessages.length ? uiMessages : hydratedMessages).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: (m.parts || [])
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('\n'),
          })) as any}
        />
        <InputArea
          value={inputText}
          onChange={(v) => setInputText(v)}
          onSubmit={(e) => {
            e.preventDefault()
            const text = inputText.trim()
            if (!text) return
            sendMessage({ role: 'user', parts: [{ type: 'text', text }], metadata: { conversationId: currentChat ?? undefined } } as any)
            // Soft refresh of conversations to reflect a newly set title after first message
            setTimeout(() => { fetch('/api/conversations').catch(() => {}) }, 1200)
            setInputText("")
            setHydratedMessages([])
          }}
          disabled={status === 'streaming'}
        />
      </div>
    </div>
  )
}
