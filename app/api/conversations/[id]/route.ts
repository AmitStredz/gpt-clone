import 'server-only'
import { requireUserId } from '@/lib/auth/clerk'
import { updateConversationTitle, deleteConversationForUser } from '@/lib/db/queries'

export const runtime = 'nodejs'

export async function PATCH(req: Request, context: any) {
  const userId = await requireUserId()
  const conversationId = context?.params?.id as string
  const body = await req.json().catch(() => ({}))
  const title = typeof body?.title === 'string' ? body.title : undefined
  if (!title) {
    return new Response(JSON.stringify({ error: 'title is required' }), { status: 400 })
  }
  try {
    await updateConversationTitle(conversationId, title)
    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Failed to update conversation' }), { status: 400 })
  }
}

export async function DELETE(_: Request, context: any) {
  const userId = await requireUserId()
  const conversationId = context?.params?.id as string
  try {
    await deleteConversationForUser(userId, conversationId)
    return Response.json({ ok: true })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'Failed to delete conversation' }), { status: 400 })
  }
}


