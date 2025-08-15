import 'server-only'
import { requireUserId } from '@/lib/auth/clerk'
import { updateUserMessageAndPrune } from '@/lib/db/queries'

export const runtime = 'nodejs'

export async function PATCH(req: Request, context: any) {
  const userId = await requireUserId()
  const messageId = context?.params?.id as string
  const body = await req.json().catch(() => ({}))
  const { conversationId, content } = body || {}
  if (!conversationId || typeof content !== 'string') {
    return new Response(JSON.stringify({ error: 'conversationId and content are required' }), { status: 400 })
  }
  try {
    const result = await updateUserMessageAndPrune({ userId, conversationId, messageId, content })
    return Response.json({ ok: true, ...result })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Failed to update message' }), { status: 400 })
  }
}

