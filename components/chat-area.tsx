"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, Volume2, Share, Download, RotateCcw } from "lucide-react"

type Message = { id: string; role: "user" | "assistant"; content: string }

interface ChatAreaProps {
  currentChat: string | null
  messages: Message[]
}

export function ChatArea({ currentChat, messages }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const hasMessages = messages.length > 0

  if (!hasMessages) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-center">
          <h1 className="text-2xl font-normal text-white mb-8">{currentChat ? 'No messages in this chat yet' : "What's on your mind today?"}</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="px-4 py-6 max-w-3xl mx-auto w-full">
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            return (
            <div key={message.id} className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 ${isUser ? 'bg-[#3b82f6]' : 'bg-[#10a37f]'} rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0`}> 
                  {isUser ? 'AS' : <div className="w-4 h-4 bg-white rounded-sm" />}
                </div>
                <div className={`flex-1 min-w-0`}> 
                  <div className={`${isUser ? 'bg-[#2a2a2a]' : 'bg-[#1f1f1f]'} text-white text-base mb-2 break-words rounded-2xl px-4 py-3 shadow-sm border border-[#2f2f2f]`}> 
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      a: (props) => <a {...props} className="underline text-blue-400 hover:text-blue-300" />,
                      code: (props) => {
                        const { children, className } = props as any
                        const isInline = !className || !/\blanguage-/.test(className)
                        return (
                          <code className={`${isInline ? 'px-1 py-0.5 rounded bg-black/30' : 'block p-3 rounded-md bg-black/40 overflow-x-auto'}`}>{children}</code>
                        )
                      },
                      ul: (props) => <ul {...props} className="list-disc pl-5" />,
                      ol: (props) => <ol {...props} className="list-decimal pl-5" />,
                      table: (props) => <div className="overflow-x-auto"><table {...props} className="min-w-full border-collapse" /></div>,
                      th: (props) => <th {...props} className="border-b border-[#333] text-left p-2" />,
                      td: (props) => <td {...props} className="border-b border-[#333] p-2 align-top" />,
                    }}>
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {/* Action Buttons - only for assistant messages */}
                  {message.role === "assistant" && (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Feedback Section - only for last assistant message */}
                      {index === messages.length - 1 && (
                        <div className="bg-[#2f2f2f] rounded-lg p-4 flex items-center justify-between">
                          <span className="text-white text-sm">Do you like this personality?</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </ScrollArea>
    </div>
  )
}
