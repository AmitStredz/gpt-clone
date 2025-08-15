import { google } from '@ai-sdk/google'
import { Attachment } from '@/lib/types/chat'

export type SupportedGoogleModel = 'gemini-1.5-pro' | 'gemini-1.5-flash'

interface ModelCapabilities {
  vision: boolean
  fileAnalysis: boolean
  maxTokens: number
  speed: 'fast' | 'balanced' | 'slow'
  description: string
}

const modelCapabilities: Record<SupportedGoogleModel, ModelCapabilities> = {
  'gemini-1.5-pro': {
    vision: true,
    fileAnalysis: true,
    maxTokens: 1048576, // 1M tokens
    speed: 'balanced',
    description: 'Most capable model with vision and file analysis'
  },
  'gemini-1.5-flash': {
    vision: true,
    fileAnalysis: false, // Flash has limited file analysis capabilities
    maxTokens: 1048576,
    speed: 'fast',
    description: 'Fastest model with vision support'
  }
}

const idMap: Record<SupportedGoogleModel, string> = {
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-flash': 'gemini-1.5-flash',
}

export function getGoogleModel(model: SupportedGoogleModel) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set')
  return google(idMap[model])
}

export function getModelCapabilities(model: SupportedGoogleModel): ModelCapabilities {
  return modelCapabilities[model]
}

export function selectOptimalModel(attachments: Attachment[] = [], userPreference?: SupportedGoogleModel): SupportedGoogleModel {
  // If user has a preference, respect it
  if (userPreference) {
    return userPreference
  }

  // Check if we have any non-image files that need analysis
  const hasFiles = attachments.some(att => att.type === 'file')
  const hasImages = attachments.some(att => att.type === 'image')

  // For file analysis, we need Pro model
  if (hasFiles) {
    return 'gemini-1.5-pro'
  }

  // For images only or text only, Flash is fine and faster
  if (hasImages || attachments.length === 0) {
    return 'gemini-1.5-flash'
  }

  // Default to Flash for better performance
  return 'gemini-1.5-flash'
}

export function getAllModels(): Array<{ id: SupportedGoogleModel; name: string; capabilities: ModelCapabilities }> {
  return Object.entries(modelCapabilities).map(([id, capabilities]) => ({
    id: id as SupportedGoogleModel,
    name: id === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro' : 'Gemini 1.5 Flash',
    capabilities
  }))
}

