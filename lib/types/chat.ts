export type Role = 'system' | 'user' | 'assistant'

export interface Attachment {
  id: string
  type: 'image' | 'file'
  mimeType: string
  bytes?: number
  secureUrl: string
  provider: 'cloudinary'
  width?: number
  height?: number
  textExtractSummary?: string
}

export interface Message {
  id: string
  conversationId: string
  role: Role
  content: string
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
  editedFromMessageId?: string
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  model: string
  createdAt: string
  updatedAt: string
}

