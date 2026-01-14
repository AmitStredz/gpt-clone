// nive code
import { MongoClient } from 'mongodb'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })
config()

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')
  const client = new MongoClient(uri)
  await client.connect()
  const url = new URL(uri)
  const dbName = (url.pathname && url.pathname !== '/') ? decodeURIComponent(url.pathname.slice(1)) : undefined
  const db = client.db(dbName)

  // Drop indexes (safe if they don't exist)
  try { await db.collection('messages').dropIndex({ conversationId: 1, createdAt: 1 } as any) } catch {}
  try { await db.collection('conversations').dropIndex({ userId: 1, updatedAt: -1 } as any) } catch {}

  await client.close()
  console.log('Migration down complete')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})

