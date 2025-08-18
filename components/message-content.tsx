import { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LoadingDots } from './loading-dots'

interface MessageContentProps {
  content: string
  isUser: boolean
  isStreaming: boolean
  isLast: boolean
  renderMarkdown?: boolean
  markdownComponents?: Record<string, (props: any) => ReactNode>
}

export function MessageContent({ 
  content, 
  isUser, 
  isStreaming, 
  isLast,
  renderMarkdown = true,
  markdownComponents 
}: MessageContentProps) {
  if (isStreaming && !isUser && isLast) {
    return (
      <div className="flex items-center gap-4 min-h-[24px] p-2">
        <LoadingDots />
        <span className="text-gray-400 text-sm">AI is typing...</span>
      </div>
    )
  }

  if (!renderMarkdown) {
    return <div className="text-[15px] text-gray-300">{content}</div>
  }

  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]} 
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  )
}
