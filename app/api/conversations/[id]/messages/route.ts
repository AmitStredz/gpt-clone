import 'server-only'
import { requireUserId } from '@/lib/auth/clerk'
import { listMessages } from '@/lib/db/queries'

export const runtime = 'nodejs'

export async function GET(_: Request, context: any) {
  const params = context?.params as { id: string }
  const userId = await requireUserId()
  const { id } = params
  const msgs = await listMessages(userId, id)
  return Response.json({
    messages: msgs.map(m => ({
      id: m._id.toString(),
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
      attachments: m.attachments || []
    }))
  })
}

