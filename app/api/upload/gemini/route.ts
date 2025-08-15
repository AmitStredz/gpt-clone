import 'server-only'
import { requireUserId } from '@/lib/auth/clerk'
import { GoogleAIFileManager } from '@google/generative-ai/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const userId = await requireUserId()
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Google API key not configured' }), { status: 500 })
  }

  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create temporary file path
    const tempPath = `/tmp/${file.name}`
    
    // Write file to temporary location
    const fs = require('fs')
    fs.writeFileSync(tempPath, buffer)
    
    // Upload to Google File API
    const fileManager = new GoogleAIFileManager(apiKey)
    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType: file.type,
      displayName: file.name,
    })
    
    // Clean up temporary file
    fs.unlinkSync(tempPath)
    
    return Response.json({
      success: true,
      file: {
        name: uploadResult.file.name,
        uri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
        sizeBytes: uploadResult.file.sizeBytes,
        displayName: uploadResult.file.displayName,
      }
    })
    
  } catch (error: any) {
    console.error('Google File API upload failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to upload file to Google File API',
      details: error.message 
    }), { status: 500 })
  }
}