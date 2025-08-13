import 'server-only'
import { requireUserId } from '@/lib/auth/clerk'
import { z } from 'zod'
import crypto from 'crypto'

export const runtime = 'nodejs'

const BodySchema = z.object({
  folder: z.string().default('chat-uploads'),
  timestamp: z.number().optional(),
})

export async function POST(req: Request) {
  await requireUserId()

  const { CLOUDINARY_API_SECRET, CLOUDINARY_API_KEY, CLOUDINARY_CLOUD_NAME } =
    process.env
  if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
    return new Response(JSON.stringify({ error: 'Cloudinary env not set' }), {
      status: 500,
    })
  }

  const json = await req.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    })
  }

  const folder = parsed.data.folder
  const timestamp = parsed.data.timestamp ?? Math.floor(Date.now() / 1000)

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + CLOUDINARY_API_SECRET)
    .digest('hex')

  return Response.json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  })
}

