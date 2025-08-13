"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Mic, Headphones, ArrowUp } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  disabled?: boolean
}

export function InputArea({ value, onChange, onSubmit, disabled }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
    <div className="border-t border-[#2f2f2f] p-4 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        <SignedOut>
          <div className="bg-[#2f2f2f] rounded-3xl p-4 flex items-center justify-between">
            <div className="text-sm text-[#8e8ea0]">Sign in to start chatting</div>
            <SignInButton mode="modal">
              <Button className="bg-white text-black hover:bg-gray-200">Sign in</Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
        <form onSubmit={onSubmit}>
          <div className="relative">
            <div className="flex items-end space-x-3 bg-[#2f2f2f] rounded-3xl p-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2 rounded-full flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Textarea
                ref={textareaRef}
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
                  <Button disabled={Boolean(disabled)} type="submit" size="sm" className="bg-white text-black hover:bg-gray-200 p-2 rounded-full">
                    <ArrowUp className="w-5 h-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2 rounded-full"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#8e8ea0] hover:bg-[#404040] hover:text-white p-2 rounded-full"
                    >
                      <Headphones className="w-5 h-5" />
                    </Button>
                  </>
                )}
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
}
