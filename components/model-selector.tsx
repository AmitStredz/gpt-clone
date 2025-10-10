"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,  Zap, Brain, Sparkles } from 'lucide-react'
import { SupportedGoogleModel, getAllModels } from '@/lib/ai/provider'

interface ModelSelectorProps {
  selectedModel?: SupportedGoogleModel
  onModelChange: (model: SupportedGoogleModel | undefined) => void
  hasAttachments?: boolean
  hasFiles?: boolean
}

export function ModelSelector({ selectedModel, onModelChange, hasAttachments, hasFiles }: ModelSelectorProps) {
  const models = getAllModels()
  const isAutoMode = !selectedModel
  
  const getModelIcon = (modelId: SupportedGoogleModel) => {
    switch (modelId) {
      case 'gemini-1.5-pro':
        return <Brain className="h-4 w-4" />
      case 'gemini-1.5-flash':
        return <Zap className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const getSpeedBadge = (speed: string) => {
    const colors = {
      fast: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      balanced: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      slow: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[speed as keyof typeof colors] || colors.balanced}`}>
        {speed}
      </span>
    )
  }
ild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-3 text-sm font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <div className="flex items-center gap-2">
            {isAutoMode ? (
              <Sparkles className="h-4 w-4 text-purple-500" />
            ) : (
              getModelIcon(currentModel)
            )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        {/* Auto Mode */}
        <DropdownMenuItem 
          onClick={() => onModelChange(undefined)}
          className={`cursor-pointer ${isAutoMode ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}
        >
          <div className="flex items-center gap-3 w-full">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <div className="flex-1">
              <div className="font-medium">Auto Select</div>
              <div className="text-xs text-gray-500">
                Automatically chooses the best model for your content
              </div>
            </div>
            {isAutoMode && <div className="text-purple-500 text-xs">✓</div>}
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Manual Model Selection */}
        {models.map((model) => (
          <DropdownMenuItem 
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`cursor-pointer ${selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              {getModelIcon(model.id)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {getSpeedBadge(model.capabilities.speed)}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  
                  )}
                </div>
              </div>
              {selectedModel === m
                <div className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Gemini Pro recommended for file analysis
                </div>
              )}
              {hasAttachments && !hasFiles && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Gemini Flash is sufficient for images
                </div>
              )}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}