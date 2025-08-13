"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
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
          <h1 className="text-2xl font-normal text-white mb-8">What's on your mind today?</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0">
      <ScrollArea className="h-full" ref={scrollAreaRef}>
        <div className="px-4 py-6 max-w-3xl mx-auto w-full">
          {messages.map((message, index) => (
            <div key={message.id} className="mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {message.role === "user" ? "AS" : <div className="w-4 h-4 bg-white rounded-sm"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-base mb-4 break-words">{message.content}</div>

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
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
