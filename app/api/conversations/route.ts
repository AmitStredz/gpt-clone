import 'server-only'
import { requireUserId } from '@/lib/auth/clerk'
import { listConversations, createConversation } from '@/lib/db/queries'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const userId = await requireUserId()
    const convos = await listConversations(userId)
    return Response.json({ conversations: convos.map(c => ({
      id: c._id.toString(),
      title: c.title ?? 'Untitled',
      model: c.model,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })) })
  } catch (err) {
    console.error('GET /api/conversations error', err)
    return new Response(JSON.stringify({ error: 'Failed to list conversations. Check MONGODB_URI and Atlas network access.' }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId()
    const body = await req.json().catch(() => ({}))
    const model = typeof body?.model === 'string' ? body.model : 'gemini-1.5-pro'
    const title = typeof body?.title === 'string' ? body.title : undefined
    const id = await createConversation({ userId, model, title })
    return Response.json({ id: id.toString() })
  } catch (err) {
    console.error('POST /api/conversations error', err)
    return new Response(JSON.stringify({ error: 'Failed to create conversation. Verify MONGODB_URI and Atlas IP allowlist.' }), { status: 500 })
  }
}

