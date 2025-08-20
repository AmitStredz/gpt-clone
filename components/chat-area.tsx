"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, ThumbsUp, ThumbsDown, Volume2, Share, Download, RotateCcw, Pencil, FileText, Image as ImageIcon } from "lucide-react"
import { Attachment } from "@/lib/types/chat"
import { LoadingDots } from "./loading-dots"

type Message = { 
  id: string; 
  role: "user" | "assistant"; 
  content: string;
  attachments?: Attachment[];
}

interface ChatAreaProps {
  currentChat: string | null
  messages: Message[]
  onEditUserMessage?: (index: number, messageId: string, newContent: string) => void
  onRegenerateResponse?: (lastUserMessage: Message) => void
  isStreaming?: boolean
}

export function ChatArea({ currentChat, messages, onEditUserMessage, onRegenerateResponse, isStreaming }: ChatAreaProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<string>("")
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null)
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)

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

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleCopyCode = async (content: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedCodeId(codeId)
      setTimeout(() => setCopiedCodeId(null), 2000)
    } catch (err) {
      console.error('Failed to copy code: ', err)
    }
  }

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setFeedbackSubmitted(messageId)
    // Here you could send feedback to your backend
    console.log(`Feedback for message ${messageId}: ${feedback}`)
  }

  const handleRegenerate = (messageIndex: number) => {
    if (onRegenerateResponse && messageIndex > 0) {
      const lastUserMessage = messages[messageIndex - 1]
      if (lastUserMessage) {
        onRegenerateResponse(lastUserMessage)
      }
    }
  }

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
    <div className="flex-1 min-h-0 bg-[#212121]">
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {messages.map((message, index) => {
            const isUser = message.role === 'user'
            const isLast = index === messages.length - 1
            const hasContent = Boolean((message.content || '').trim().length)
            return (
            <div key={message.id} className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'} w-full group`}>
              <div className={`${isUser ? 'max-w-[85%]' : 'max-w-[95%]'} min-w-0`}>
                <div className="w-full"> 
                  {editingId === message.id && isUser ? (
                    <div className="bg-[#2a2a2a] rounded-2xl p-3 border border-[#2f2f2f]">
                      <textarea
                        className="w-full bg-transparent text-white text-sm outline-none resize-none"
                        value={draft}
                        rows={3}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                      <div className="mt-2 flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" className="cursor-pointer" onClick={() => { setEditingId(null); setDraft("") }}>Cancel</Button>
                        <Button size="sm" className="cursor-pointer" onClick={() => {
                          if (onEditUserMessage) onEditUserMessage(index, message.id, draft.trim())
                          setEditingId(null)
                          setDraft("")
                        }}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* File Attachments - ChatGPT style */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.attachments.map((attachment) => {
                            const fileName = attachment.originalFileName || attachment.id.split('/').pop() || 'file'
                            const fileExtension = attachment.mimeType.split('/')[1]?.toUpperCase() || 'FILE'
                            
                            return (
                              <div key={attachment.id}>
                                {attachment.type === 'image' ? (
                                  // Image preview - show actual image
                                  <div className="mb-3">
                                    <img
                                      src={attachment.secureUrl}
                                      alt={fileName}
                                      className="max-w-48 max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                                      onClick={() => window.open(attachment.secureUrl, '_blank')}
                                    />
                                    <div className="text-xs text-[#8e8ea0] mt-1">
                                      {fileName}
                                    </div>
                                  </div>
                                ) : (
                                  // File card - show file info
                                  <div 
                                    className="flex items-center w-full min-w-0 max-w-md gap-3 px-3 py-2 border border-white/10 rounded-lg cursor-pointer hover:bg-[#3a3a3a] transition-colors"
                                    onClick={() => window.open(attachment.secureUrl, '_blank')}
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-white truncate">
                                        {fileName}
                                      </div>
                                      <div className="text-xs text-[#8e8ea0] uppercase">
                                        {fileExtension}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                      
                      {/* Text content with background only for user messages */}
                      <div className="flex items-start w-full">
                        <div className={`prose prose-invert w-full break-words ${isUser ? 'bg-white/10 rounded-3xl px-4 py-2' : ''}`}>
                          {(!isUser && isLast && isStreaming && !hasContent) ? (
                            <div className="flex items-center gap-4 min-h-[24px] p-2">
                              <LoadingDots />
                              <span className="text-gray-400 text-sm">AI is typing...</span>
                            </div>
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                              a: (props) => <a {...props} className="text-blue-400 text-[13px] sm:text-[15px] hover:text-blue-300 underline break-words" target="_blank" rel="noopener noreferrer" />,
                              p: (props) => <p {...props} className={`leading-7 text-[13px] sm:text-[15px] ${isUser ? 'text-left' : 'text-gray-200'} break-words`} />,
                              code: (props) => {
                                const { children, className } = props as any
                                const isInline = !className || !/\blanguage-/.test(className)
                                
                                if (isInline) {
                                  return (
                                    <code className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-sm">{children}</code>
                                  )
                                }
                                
                                // Extract language from className (e.g., "language-javascript" -> "javascript")
                                const language = className?.replace('language-', '') || 'text'
                                const languageDisplay = language === 'text' ? 'TEXT' : language.toUpperCase()
                                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`
                                
                                return (
                                  <div className="my-4 bg-black/30 rounded-lg overflow-hidden">
                                    {/* Header with language and buttons */}
                                    <div className="flex items-center justify-between px-4 py-3">
                                      <span className="text-white text-xs font-sans">{languageDisplay.toLowerCase()}</span>
                                      <div className="flex items-center space-x-4">
                                        <button
                                          onClick={() => handleCopyCode(children as string, codeId)}
                                          className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors text-xs"
                                          title="Copy code"
                                        >
                                          {copiedCodeId === codeId ? (
                                            <>
                                              <div className="w-3 h-3 text-green-400">✓</div>
                                              <span>Copied</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy</span>
                                            </>
                                          )}
                                        </button>
                                        <button
                                          className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors text-xs"
                                          title="Edit code"
                                        >
                                          <Pencil className="w-3 h-3" />
                                          <span>Edit</span>
                                        </button>
                                      </div>
                                    </div>
                                    {/* Code content */}
                                    <pre className="p-4 overflow-x-auto text-sm text-gray-200 leading-relaxed font-sans">
                                      <code className="font-sans">{children}</code>
                                    </pre>
                                  </div>
                                )
                              },
                              pre: (props) => {
                                // If pre contains code, let the code component handle it
                                if (props.children && typeof props.children === 'object' && 'type' in props.children && props.children.type === 'code') {
                                  return props.children
                                }
                                // Otherwise, render as regular pre
                                return <pre {...props} className="overflow-x-auto font-mono text-sm text-gray-100"/>
                              },
                              h1: (props) => <h1 {...props} className="text-4xl font-light my-6 text-white border-b border-gray-600 pb-2" />,
                              h2: (props) => <h2 {...props} className="text-3xl font-light my-5 text-white mt-8" />,
                              h3: (props) => <h3 {...props} className="text-2xl font-light my-4 text-gray-100" />,
                              strong: (props) => <strong {...props} className="font-semibold text-white" />,
                              ul: (props) => <ul {...props} className="list-disc pl-6 mb-6 space-y-3 text-gray-300 break-words" />,
                              ol: (props) => <ol {...props} className="list-decimal pl-6 mb-6 space-y-3 text-gray-300 break-words" />,
                              li: (props) => <li {...props} className="text-[13px] sm:text-[15px] leading-7 mb-2 break-words" />,
                              blockquote: (props) => <blockquote {...props} className="border-l-4 border-gray-500 pl-6 my-6 italic text-gray-300 bg-gray-800/30 py-4 pr-4 rounded-r-lg" />,
                              table: (props) => <div className="overflow-x-auto my-4"><table {...props} className="min-w-full border-collapse border border-gray-600" /></div>,
                              th: (props) => <th {...props} className="border border-gray-600 text-left p-3 bg-gray-700/30 font-semibold" />,
                              td: (props) => <td {...props} className="border border-gray-600 p-3 align-top" />,
                            }}>
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - only for assistant messages and only after response is complete */}
                  {message.role === "assistant" && !isStreaming && (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          onClick={() => handleCopy(message.content, message.id)}
                          title="Copy message"
                        >
                          {copiedMessageId === message.id ? (
                            <div className="w-4 h-4 text-green-400">✓</div>
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          title="Like response"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          title="Dislike response"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          title="Read aloud"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          title="Share"
                        >
                          <Share className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                          onClick={() => handleRegenerate(index)}
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Feedback Section - only for last assistant message and only after response is complete */}
                      {index === messages.length - 1 && message.role === "assistant" && !isStreaming && (
                        <div className={`bg-[#2f2f2f] rounded-lg p-4 flex items-center justify-between transition-all duration-300 ${
                          feedbackSubmitted === message.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}>
                          {feedbackSubmitted === message.id ? (
                            <span className="text-green-400 text-sm font-medium">Thanks for your feedback!</span>
                          ) : (
                            <>
                              <span className="text-white text-sm">Do you like this response?</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2"
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2"
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Edit action - only for user messages */}
                  {message.role === 'user' && editingId !== message.id && (
                    <div className="flex justify-end items-center gap-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                        onClick={() => handleCopy(message.content, message.id)}
                        title="Copy message"
                      >
                        {copiedMessageId === message.id ? (
                          <div className="w-4 h-4 text-green-400">✓</div>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#8e8ea0] hover:bg-[#2f2f2f] hover:text-white p-2 cursor-pointer"
                        onClick={() => { setEditingId(message.id); setDraft(message.content) }}
                        title="Edit message"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
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
