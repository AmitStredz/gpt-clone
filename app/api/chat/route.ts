import 'server-only'
import { streamText, convertToCoreMessages } from 'ai'
import { getGoogleModel, selectOptimalModel, type SupportedGoogleModel } from '@/lib/ai/provider'
import { requireUserId } from '@/lib/auth/clerk'
import { addMessage, createConversation, getConversation, updateConversationTitle, listMessages } from '@/lib/db/queries'
import { trimMessagesForModel } from '@/lib/ai/context-window'
import type { Message } from '@/lib/types/chat'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  // Capture userId once so we can reuse inside stream callbacks
  const userId = await requireUserId()
  const body = await req.json().catch(() => ({}))
  const requestedModel: SupportedGoogleModel | undefined = body?.model
  const conversationIdHeader = req.headers.get('x-conversation-id') || undefined
  const conversationIdInput = (body?.conversationId as string | undefined) || conversationIdHeader
  const incomingMessages = (body?.messages ?? []) as Array<{ 
    id?: string; 
    role: 'system'|'user'|'assistant'; 
    content?: string; 
    parts?: Array<{ type: string; text?: string }>
    metadata?: { attachments?: any[]; model?: SupportedGoogleModel }
  }>
  
  // Extract attachments and model preference from the last message's metadata
  const lastMessage = incomingMessages[incomingMessages.length - 1]
  const attachments = lastMessage?.metadata?.attachments || []
  const metadataModel = lastMessage?.metadata?.model

  // Select optimal model based on attachments and user preference (metadata takes precedence)
  const model = selectOptimalModel(attachments, metadataModel || requestedModel)

  // Normalize minimal UI messages to our internal simple Message[] with text content only
  const normalized: Message[] = incomingMessages.map((m, index) => {
    // For the last message (user message), include any attachments
    const messageAttachments = (index === incomingMessages.length - 1 && m.role === 'user') ? attachments : []
    
    return {
      id: m.id ?? `m_${index}`,
      conversationId: 'temp',
      role: m.role,
      content: m.content ?? (m.parts?.filter(p => p.type === 'text').map(p => p.text).join('\n') ?? ''),
      attachments: messageAttachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })

  const trimmed = trimMessagesForModel(normalized)

  // Convert messages to multimodal format for Gemini
  const convertToMultimodalMessages = (messages: Message[]) => {
    return messages.map((m) => {
      const content: any[] = []
      
      // Add text content if present
      if (m.content.trim()) {
        content.push({ type: 'text', text: m.content })
      }
      
      // Add attachments
      m.attachments?.forEach((attachment) => {
        if (attachment.type === 'image') {
          content.push({
            type: 'image',
            image: attachment.secureUrl
          })
        } else if (attachment.type === 'file') {
          // For file attachments, check if we have Google File URI for direct processing
          if (attachment.googleFileUri) {
            // Use Google File API URI for direct file processing - for Vercel AI SDK
            content.push({
              type: 'file',
              data: attachment.googleFileUri, // This should be the Google File API URI
              mediaType: attachment.mimeType
            })
          } else {
            // Fallback to descriptive text for files without Google File URI
            const fileName = attachment.id.split('/').pop()
            const fileSize = attachment.bytes ? ` (${Math.round(attachment.bytes / 1024)} KB)` : ''
            
            if (attachment.mimeType === 'application/pdf') {
              content.push({
                type: 'text',
                text: `[PDF Document: ${fileName}${fileSize}] - I can see you've uploaded a PDF document. Please copy and paste the text content or describe what specific information you're looking for in the document.`
              })
            } else if (attachment.mimeType.includes('document')) {
              content.push({
                type: 'text',
                text: `[Document: ${fileName}${fileSize}] - I can see you've uploaded a document. Please copy and paste the text content or tell me what specific information you're looking for.`
              })
            } else if (attachment.mimeType === 'text/plain' || attachment.mimeType.includes('csv')) {
              content.push({
                type: 'text',
                text: `[Text/CSV File: ${fileName}${fileSize}] - I can see you've uploaded a text or CSV file. Please copy and paste the content for me to analyze.`
              })
            } else {
              content.push({
                type: 'text',
                text: `[File: ${fileName}${fileSize} - ${attachment.mimeType}] - I can see you've uploaded a file. Please describe what's in the file or what you'd like me to help you with.`
              })
            }
          }
        }
      })
      
      // If no content at all, add empty text
      if (content.length === 0) {
        content.push({ type: 'text', text: '' })
      }
      
      return {
        role: m.role,
        content: content.length === 1 && content[0].type === 'text' 
          ? content[0].text  // Simple text content
          : content          // Multimodal content
      }
    })
  }

  const result = await streamText({
    model: getGoogleModel(model),
    messages: convertToMultimodalMessages(trimmed),
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
        
        // Check if this user message already exists (regeneration scenario)
        let shouldAddUserMessage = true
        if (userText && conversationId) {
          const existingMessages = await listMessages(userId, conversationId)
          const lastMessage = existingMessages[existingMessages.length - 1]
          if (lastMessage && lastMessage.role === 'user' && lastMessage.content === userText) {
            shouldAddUserMessage = false // This is a regeneration, don't duplicate
          }
        }
        
        if (userText && shouldAddUserMessage) {
          const lastNormalizedMessage = normalized[normalized.length - 1]
          await addMessage({ 
            conversationId, 
            role: 'user', 
            content: userText, 
            attachments: lastNormalizedMessage?.attachments 
          })
        }
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

