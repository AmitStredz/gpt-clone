import 'server-only'
import { streamText, convertToCoreMessages } from 'ai'
import { getGoogleModel, type SupportedGoogleModel } from '@/lib/ai/provider'
import { requireUserId } from '@/lib/auth/clerk'
import { trimMessagesForModel } from '@/lib/ai/context-window'
import type { Message } from '@/lib/types/chat'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  await requireUserId()
  const body = await req.json().catch(() => ({}))
  const model: SupportedGoogleModel = body?.model ?? 'gemini-1.5-pro'
  const incomingMessages = (body?.messages ?? []) as Array<{ id?: string; role: 'system'|'user'|'assistant'; content?: string; parts?: Array<{ type: string; text?: string }> }>

  // Normalize minimal UI messages to our internal simple Message[] with text content only
  const normalized: Message[] = incomingMessages.map((m, index) => ({
    id: m.id ?? `m_${index}`,
    conversationId: 'temp',
    role: m.role,
    content: m.content ?? (m.parts?.filter(p => p.type === 'text').map(p => p.text).join('\n') ?? ''),
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  const trimmed = trimMessagesForModel(normalized)

  const result = await streamText({
    model: getGoogleModel(model),
    messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
  })

  return result.toUIMessageStreamResponse()
}

