"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { ChatArea } from "./chat-area"
import { InputArea } from "./input-area"
import { useChat } from "@ai-sdk/react"

export function ChatGPTInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChat, setCurrentChat] = useState<string | null>(null)

  const { messages: uiMessages, setMessages, sendMessage, status } = useChat()
  const [inputText, setInputText] = useState("")

  const handleNewChat = () => {
    setMessages([])
    setCurrentChat(null)
  }

  return (
    <div className="flex h-screen max-h-screen bg-[#212121] text-white overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentChat={currentChat}
        onChatSelect={setCurrentChat}
        onNewChat={handleNewChat}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <ChatArea
          currentChat={currentChat}
          messages={uiMessages.map((m: any) => ({
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
            sendMessage({ role: 'user', parts: [{ type: 'text', text }] } as any)
            setInputText("")
          }}
          disabled={status === 'streaming'}
        />
      </div>
    </div>
  )
}
