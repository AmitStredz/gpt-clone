"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { ChatArea } from "./chat-area"
import { InputArea } from "./input-area"
import { LoadingDots } from "./loading-dots"
import { Chat as ReactChat, useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useRouter } from 'next/navigation'
import { Attachment } from "@/lib/types/chat"
import { SupportedGoogleModel } from "@/lib/ai/provider"
import { useIsMobile } from "@/hooks/use-mobile"
import { SignedIn } from "@clerk/nextjs"

export function ChatGPTInterface({ chatId }: { chatId?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentChat, setCurrentChat] = useState<string | null>(chatId ?? null)
  const [hydratedMessages, setHydratedMessages] = useState<any[]>([])
  const router = useRouter()
  const hasAutoRedirectedRef = useRef(false)
  const pendingCreationRef = useRef(false)
  const isMobile = useIsMobile()

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
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [selectedModel, setSelectedModel] = useState<SupportedGoogleModel | undefined>(undefined)

  const handleRegenerateResponse = async (lastUserMessage: any) => {
    try {
      if (!currentChat || !lastUserMessage?.id) return

      // 1) Prune all messages after the selected user message in the DB
      // Reuse the edit endpoint behavior by patching the same content
      await fetch(`/api/messages/${lastUserMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: currentChat, content: lastUserMessage.content })
      })

      // 2) Reload pruned conversation from DB
      const res = await fetch(`/api/conversations/${currentChat}/messages`, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const msgs = (data?.messages ?? []).map((m: any) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text', text: m.content }],
        attachments: m.attachments || []
      }))
      setHydratedMessages(msgs as any)
      setMessages(msgs as any)

      // 3) Trigger regeneration (assistant completion) using the pruned context
      const lastMessage = msgs[msgs.length - 1]
      if (!lastMessage || lastMessage.role !== 'user') return

            attachments: m.attachments || []
          }))
        })
      })

      if (!response.ok || !response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      // Add assistant message placeholder with loading animation
      const assistantId = `assistant_${Date.now()}`
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        isLoading: true,
        parts: [{ type: 'text', text: 'Loading...', component: LoadingDots }]
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const json = line.slice(6)
          try {
            const event = JSON.parse(json)
            if (event.type === 'text-delta' && event.delta) {
              
    } catch (e) {
      console.error('Failed to regenerate response:', e)
    }
  }

  const handleNewChat = async () => {
    // Just clear local state and navigate to a clean chat UI.
    setMessages([]);
    setHydratedMessages([]);
    setCurrentChat(null);{
      if (!currentChat) {
        setHydratedMessages([])
        return
      }
      try {
        const res = await fetch(`/api/conversations/${currentChat}/messages`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const msgs = (data?.messages ?? []).map((m: any) => ({ 
          id: m.id, 
          role: m.role, 
          parts: [{ type: 'text', text: m.content }],
          attachments: m.attachments || []
        }))
        setHydratedMessages(msgs as any)
        setMessages(msgs as any)
      } catch {
        // ignore
      }
    }
    hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat])

  // Auto-redirect to newly created conversation after first message completes on /chat/new only
  useEffect(() => {
    if (currentChat) return
    if (!pendingCreationRef.current) return
    if (hasAutoRedirectedRef.current) return
    if (status !== 'ready') return
    // After streaming completes, fetch most recent conversation and redirect
    (async () => {
      try {
        const res = await fetch('/api/conversations', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const latest = (data?.conversations ?? [])[0]
        if (latest?.id) {
          hasAutoRedirectedRef.current = true
          pendingCreationRef.current = false
          setCurrentChat(latest.id)
          router.replace(`/chat/${latest.id}`)
          fetch('/api/conversations').catch(() => {})
        }
      } catch {
        // ignore
      }
    })()
  }, [status, currentChat, router]);

  // Ensure sidebar is closed by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  return (
    <div className="flex h-screen max-h-screen bg-[#212121] text-white overflow-hidden">
      <SignedIn>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentChat={currentChat}
        onChatSelect={(id) => {
          setCurrentChat(id)
          router.push(`/chat/${id}`)
        }}
        onNewChat={handleNewChat}
      />
      </SignedIn>
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Hea p.text)
              .join('\n'),
            attachments: m.attachments || []
          })) as any}
          isStreaming={status === 'streaming'}
          onRegenerateResponse={handleRegenerateResponse}
          onEditUserMessage={async (index, messageId, newContent) => {
            if (!newContent) { return }
            
            // Persist edit and prune in DB first
            if (currentChat) {
              try {
                await fetch(`/api/messages/${messageId}`, {
                  method: 'PATCH',
                  headers: { 'Contenments || []
                  }))
                  setHydratedMessages(msgs as any)
                  setMessages(msgs as any)
                  
                  // Now trigger regeneration by sending just the AI completion
                  const lastMessage = msgs[msgs.length - 1]
                  if (lastMessage && lastMessage.role === 'user') {
                    // Send the request to get AI response without adding another user message
                    const response = await fetch('/api/chat', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'x-conversation-id': currentChat 
                      },
                      body: JSON.stringify({ 
                        messages: msgs.map((m: any) => ({
                          role: m.role,
                          content: (m.parts || [])
                            .filter((p: any) => p.type === 'text')
                            .map((p: any) => p.text)
                            .join('\n')
                        }))
                      })
                    })
                    
                    if (response.ok && response.body) {
                      const reader = response.body.getReader()
                      const decoder = new TextDecoder()
                      let assistantContent = ''
                      
                      // Add assistant message placeholder with loading
                      const assistantId = `assistant_${Date.now()}`
                      setMessages(prev => [...prev, { 
                        id: assistantId, 
                        role: 'assistant', 
                        isLoading: true,
                        parts: [{ 
                          type: 'text', 
                          text: 'Loading...',
                          component: LoadingDots
                        }] 
                      }])
                      
                      while (true) {
                        const { done, value } = await reader.read()
                        if (done) break
                        
                        const chunk = decoder.decode(value, { stream: true })
                        const lines = chunk.split('\n')
                        
                        for (const line of lines) {
                          if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            try {
                              const event = JSON.parse(data)
                              if (event.type === 'text-delta' && event.delta) {
                                assistantContent += event.delta
                                setMessages(prev => prev.map(m => 
                                  m.id === assistantId 
                                    ? { ...m, parts: [{ type: 'text', text: assistantContent }] }
                                    : m
                                ))
                              }
                            } catch (e) {
                              // ignore parse errors
                            }
                          }
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to update message:', e)
                return
              }
            }
          }}
        />
        <InputArea
          value={inputText}
          onChange={(v) => setInputText(v)}
          onSubmit={(e) => {
            e.preventDefault()
            const text = inputText.trim()
            if (!text && attachments.length === 0) return
            // If we are on a fresh chat (no id yet), mark creation to enable post-send redirect
            if (!currentChat) pendingCreationRef.current = true
            // Let the server create the conversation
            // and then redirect to the created chat once the response finishes via a follow-up fetch.
            sendMessage({ 
              role: 'user', 
              parts: [{ type: 'text', text }], 
              attachments: attachments, // Add attachments directly to the message
              metadata: { 
                conversationId: currentChat ?? undefined,
                attachments: attachments,
                model: selectedModel
              } 
            } as any)
            // Soft refresh of conversations to reflect a newly set title after first message
            setTimeout(() => { fetch('/api/conversations').catch(() => {}) }, 1200)
            setInputText("")
            setAttachments([])
            setHydratedMessages([])
          }}
          disabled={status === 'streaming'}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  )
}
