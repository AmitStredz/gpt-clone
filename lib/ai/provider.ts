import { google } from '@ai-sdk/google'

export type SupportedGoogleModel = 'gemini-1.5-pro' | 'gemini-1.5-flash'

const idMap: Record<SupportedGoogleModel, string> = {
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
}

export function getGoogleModel(model: SupportedGoogleModel) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  return google(idMap[model])
}

