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
  // Use database from URI path if present, else default name
  const url = new URL(process.env.MONGODB_URI as string)
  const dbName = (url.pathname && url.pathname !== '/') ? decodeURIComponent(url.pathname.slice(1)) : undefined
  return client.db(dbName)
}

