import { ObjectId, type Db } from 'mongodb'
import { getDb } from './client'
import type { ConversationDoc, MessageDoc } from './schema'

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

export async function addMessage({ conversationId, role, content }: { conversationId: string; role: 'system' | 'user' | 'assistant'; content: string }) {
  const db = await getDb()
  const now = new Date()
  const convObjectId = new ObjectId(conversationId)
  const msgId = new ObjectId()
  await messages(db).insertOne({
    _id: msgId,
    conversationId: convObjectId,
    role,
    content,
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

