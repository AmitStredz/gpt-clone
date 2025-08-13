import type { Message } from '@/lib/types/chat'

// Placeholder: implement token-aware trimming later. For now, cap to last N messages.
export function trimMessagesForModel(messages: Message[], maxMessages = 30): Message[] {
  if (messages.length <= maxMessages) return messages
  return messages.slice(-maxMessages)
}

