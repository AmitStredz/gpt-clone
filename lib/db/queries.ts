import { ObjectId, type Db } from 'mongodb'
import { getDb } from './client'
import type { ConversationDoc, MessageDoc } from './schema'
import { Attachment } from '@/lib/types/chat'

function conversations(db: Db) {
  return db.collection<ConversationDoc>('conversations')
}
function messages(db: Db) {
  return db.collection<MessageDoc>('messages')
}

export async function createConversation({ userId, model, title }: { userId: string; model: string; title?: string }) {
  const db = await getDb()
  const now = new Date()
  const result = await conversations(db).insertOne({
    _id: new ObjectId(),
    userId,
    title: title ?? null,
    model,
    createdAt: now,
    updatedAt: now,
  } as ConversationDoc)
  return result.insertedId
}

export async function listConversations(userId: string) {
  const db = await getDb()
  return conversations(db)
    .find({ userId })
    .sort({ updatedAt: -1 })
    .project({})
    .toArray()
}

export async function getConversation(userId: string, id: string) {
  const db = await getDb()
  const convo = await conversations(db).findOne({ _id: new ObjectId(id), userId })
  return convo ?? null
}

export async function addMessage({ 
  conversationId, 
  role, 
  content, 
  attachments 
}: { 
  conversationId: string; 
  role: 'system' | 'user' | 'assistant'; 
  content: string;
  attachments?: Attachment[]
}) {
  const db = await getDb()
  const now = new Date()
  const convObjectId = new ObjectId(conversationId)
  const msgId = new ObjectId()
  await messages(db).insertOne({
    _id: msgId,
    conversationId: convObjectId,
    role,
    content,
    attachments,
    createdAt: now,
    updatedAt: now,
  } as MessageDoc)
  await conversations(db).updateOne({ _id: convObjectId }, { $set: { updatedAt: now } })
  return msgId
}

export async function listMessages(userId: string, conversationId: string) {
  const db = await getDb()
  const conv = await getConversation(userId, conversationId)
  if (!conv) return []
  return messages(db)
    .find({ conversationId: new ObjectId(conversationId) })
    .sort({ createdAt: 1 })
    .toArray()
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const db = await getDb()
  await conversations(db).updateOne({ _id: new ObjectId(conversationId) }, { $set: { title, updatedAt: new Date() } })
}

export async function updateUserMessageAndPrune(options: { userId: string; conversationId: string; messageId: string; content: string }) {
  const { userId, conversationId, messageId, content } = options
  const db = await getDb()
  const conv = await conversations(db).findOne({ _id: new ObjectId(conversationId), userId })
  if (!conv) throw new Error('Conversation not found')
  const msgId = new ObjectId(messageId)
  const userMsg = await messages(db).findOne({ _id: msgId, conversationId: conv._id, role: 'user' })
  if (!userMsg) throw new Error('User message not found')

  const now = new Date()
  await messages(db).updateOne({ _id: msgId }, { $set: { content, updatedAt: now } })
  const delRes = await messages(db).deleteMany({ conversationId: conv._id, createdAt: { $gt: userMsg.createdAt } })
  await conversations(db).updateOne({ _id: conv._id }, { $set: { updatedAt: now } })
  return { pruned: delRes.deletedCount ?? 0 }
}

export async function pruneAssistantMessageAndRegenerate(options: { userId: string; conversationId: string; messageId: string }) {
  const { userId, conversationId, messageId } = options
  const db = await getDb()
  const conv = await conversations(db).findOne({ _id: new ObjectId(conversationId), userId })
  if (!conv) throw new Error('Conversation not found')
  const msgId = new ObjectId(messageId)
  const assistantMsg = await messages(db).findOne({ _id: msgId, conversationId: conv._id, role: 'assistant' })
  if (!assistantMsg) throw new Error('Assistant message not found')

  const now = new Date()
  // Delete the assistant message
  await messages(db).deleteOne({ _id: msgId })
  await conversations(db).updateOne({ _id: conv._id }, { $set: { updatedAt: now } })
  return { pruned: 1 }
}

export async function deleteConversationForUser(userId: string, conversationId: string) {
  const db = await getDb()
  const conv = await conversations(db).findOne({ _id: new ObjectId(conversationId), userId })
  if (!conv) throw new Error('Conversation not found')
  await messages(db).deleteMany({ conversationId: conv._id })
  await conversations(db).deleteOne({ _id: conv._id })
  return { ok: true }
}

