import 'server-only'
import { streamText, convertToCoreMessages } from 'ai'
import { getGoogleModel, type SupportedGoogleModel } from '@/lib/ai/provider'
import { requireUserId } from '@/lib/auth/clerk'
import { addMessage, createConversation, getConversation, updateConversationTitle } from '@/lib/db/queries'
import { trimMessagesForModel } from '@/lib/ai/context-window'
import type { Message } from '@/lib/types/chat'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  // Capture userId once so we can reuse inside stream callbacks
  const userId = await requireUserId()
  const body = await req.json().catch(() => ({}))
  const model: SupportedGoogleModel = body?.model ?? 'gemini-1.5-pro'
  const conversationIdHeader = req.headers.get('x-conversation-id') || undefined
  const conversationIdInput = (body?.conversationId as string | undefined) || conversationIdHeader
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

  // Persist user message and assistant output at finish
  let conversationId = conversationIdInput
  return result.toUIMessageStreamResponse({
    async consumeSseStream({ stream }) {
      const userText = normalized[normalized.length - 1]?.role === 'user' ? normalized[normalized.length - 1]?.content : ''
      let assistantText = ''
      const reader = stream.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        const lines = value.split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          try {
            const event = JSON.parse(payload)
            if (event.type === 'text-delta' && typeof event.delta === 'string') {
              assistantText += event.delta
            }
          } catch {}
        }
      }
      try {
        if (!conversationId) {
          const id = await createConversation({ userId, model })
          conversationId = id.toString()
        } else {
          let conv = await getConversation(userId, conversationId)
          if (!conv) {
            const id = await createConversation({ userId, model })
            conversationId = id.toString()
            conv = await getConversation(userId, conversationId)
          }
        }
        if (userText) await addMessage({ conversationId, role: 'user', content: userText })
        if (assistantText) await addMessage({ conversationId, role: 'assistant', content: assistantText })
        // If title not set or empty, set it from the first user message (truncate)
        const titleCandidate = userText?.split('\n')[0]?.slice(0, 60)
        if (titleCandidate) {
          const existing = await getConversation(userId, conversationId)
          if (!existing?.title || existing.title.trim() === '' || !conversationIdInput) {
            await updateConversationTitle(conversationId, titleCandidate)
          }
        }
      } catch {}
    }
  })
}

