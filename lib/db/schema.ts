import { z } from 'zod'
import { ObjectId } from 'mongodb'

export const AttachmentSchema = z.object({
  id: z.string(),
  type: z.union([z.literal('image'), z.literal('file')]),
  mimeType: z.string(),
  bytes: z.number().optional(),
  secureUrl: z.string(),
  provider: z.literal('cloudinary'),
  width: z.number().optional(),
  height: z.number().optional(),
  textExtractSummary: z.string().optional(),
  googleFileUri: z.string().optional(),
  googleFileName: z.string().optional(),
  originalFileName: z.string().optional(),
})

export const ConversationDocSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.string(),
  title: z.string().nullable().optional(),
  model: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type ConversationDoc = z.infer<typeof ConversationDocSchema>

export const MessageDocSchema = z.object({
  _id: z.instanceof(ObjectId),
  conversationId: z.instanceof(ObjectId),
  role: z.union([z.literal('system'), z.literal('user'), z.literal('assistant')]),
  content: z.string(),
  attachments: z.array(AttachmentSchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type MessageDoc = z.infer<typeof MessageDocSchema>

