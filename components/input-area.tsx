"use client"

import type React from "react"

import { useRef, useEffect, forwardRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Mic, Headphones, ArrowUp } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileUpload } from "@/components/file-upload"
import { ModelSelector } from "@/components/model-selector"
import { Attachment } from "@/lib/types/chat"
import { SupportedGoogleModel } from "@/lib/ai/provider"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  disabled?: boolean
  attachments?: Attachment[]
  onAttachmentsChange?: (attachments: Attachment[]) => void
  selectedModel?: SupportedGoogleModel
  onModelChange?: (model: SupportedGoogleModel | undefined) => void
}

export const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(function InputArea(props, externalRef) {
  const { 
    value, 
    onChange, 
    onSubmit, 
    disabled, 
    attachments = [], 
    onAttachmentsChange, 
    selectedModel, 
    onModelChange 
  } = props

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showFileUpload, setShowFileUpload] = useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Let the form submit handler execute
      const form = (e.target as HTMLElement).closest('form') as HTMLFormElement | null
      if (form) form.requestSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="p-4 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <SignedOut>
          <div className="bg-[#2f2f2f] rounded-3xl p-4 flex items-center justify-between cursor-not-allowed">
            <div className="text-sm text-[#8e8ea0]">Sign in to start chatting</div>
            <SignInButton mode="modal">
              <Button className="bg-white rounded-full text-black hover:bg-gray-200">Sign in</Button>
            </SignInButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          {/* Model Selector */}
          {onModelChange && (
            <div className="flex justify-end mb-3">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                hasAttachments={attachments.length > 0}
                hasFiles={attachments.some(att => att.type === 'file')}
              />
            </div>
          )}
          
          <form onSubmit={onSubmit}>
            <div className="relative">
              <div className="bg-[#2f2f2f] rounded-3xl p-3">
                {/* Attachments row - inside the input container */}
                {attachments.length > 0 && onAttachmentsChange && (
                  <div className="mb-3 pb-3 border-b border-gray-600">
                    <FileUpload
                      attachments={attachments}
                      onAttachmentsChange={onAttachmentsChange}
                      disabled={disabled}
                      showPreview={true}
                    />
                  </div>
                )}
                
                {/* Input row */}
                <div className="flex items-end space-x-3">
                  {onAttachmentsChange && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <FileUpload
                              attachments={attachments}
                              onAttachmentsChange={onAttachmentsChange}
                              disabled={disabled}
                              showPreview={false}
                              customButton={
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2 rounded-full cursor-pointer"
                                >
                                  <Plus className="w-5 h-5" />
                                </Button>
                              }
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Attach files</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <Textarea
                    ref={(el) => {
                      textareaRef.current = el
                      if (typeof externalRef === 'function') externalRef(el)
                      else if (externalRef && 'current' in (externalRef as any)) (externalRef as any).current = el
                    }}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything"
                    className="flex-1 bg-transparent border-none text-white placeholder-[#8e8ea0] resize-none min-h-[24px] max-h-32 text-base leading-6 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={1}
                    disabled={Boolean(disabled)}
                  />

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {value.trim() ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              disabled={Boolean(disabled)} 
                              type="submit" 
                              size="sm" 
                              className="bg-white text-black hover:bg-gray-200 p-2 rounded-full cursor-pointer disabled:opacity-50"
                            >
                              {disabled ? (
                                <LoadingSpinner size="sm" className="text-black" />
                              ) : (
                                <ArrowUp className="w-5 h-5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {disabled ? 'Sending...' : 'Send (Cmd/Ctrl + Enter)'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2 rounded-full cursor-pointer"
                              >
                                <Mic className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voice input</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2 rounded-full cursor-pointer"
                              >
                                <Headphones className="w-5 h-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Audio output</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </SignedIn>

        <div className="text-center mt-3">
          <p className="text-xs text-[#8e8ea0]">
            ChatGPT can make mistakes. Check important info.{" "}
            <button className="underline hover:no-underline">See Cookie Preferences</button>.
          </p>
        </div>
      </div>
    </div>
  )
})