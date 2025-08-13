import { MongoClient } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined
}

export function getMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (!global.__mongoClient) {
    global.__mongoClient = new MongoClient(uri, {
      // recommended options
      maxPoolSize: 10,
    })
  }

  return global.__mongoClient
}

export async function getDb() {
  const client = getMongoClient()
  await client.connect()
  return client.db()
}

