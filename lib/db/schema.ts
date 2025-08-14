import { z } from 'zod'
import { ObjectId } from 'mongodb'

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
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type MessageDoc = z.infer<typeof MessageDocSchema>

