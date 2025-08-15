import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-transparent border-t-current",
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 p-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500">
        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
          <LoadingDots className="text-green-500" />
        </div>
      </div>
      <div className="text-sm text-gray-500">AI is thinking...</div>
    </div>
  )
}