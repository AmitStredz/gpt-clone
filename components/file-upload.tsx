"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Paperclip, X, FileText, Image as ImageIcon, FileSpreadsheet, File } from 'lucide-react'
import { Attachment } from '@/lib/types/chat'

interface FileUploadProps {
  onAttachmentsChange: (attachments: Attachment[]) => void
  attachments: Attachment[]
  disabled?: boolean
  showPreview?: boolean
  customButton?: React.ReactNode
}

const SUPPORTED_FILE_TYPES = {
  'image/jpeg': { icon: ImageIcon, color: 'text-green-500' },
  'image/png': { icon: ImageIcon, color: 'text-green-500' },
  'image/gif': { icon: ImageIcon, color: 'text-green-500' },
  'image/webp': { icon: ImageIcon, color: 'text-green-500' },
  'application/pdf': { icon: FileText, color: 'text-red-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500' },
  'application/msword': { icon: FileText, color: 'text-blue-500' },
  'text/plain': { icon: FileText, color: 'text-gray-500' },
  'text/csv': { icon: FileSpreadsheet, color: 'text-green-600' },
  'application/vnd.ms-excel': { icon: FileSpreadsheet, color: 'text-green-600' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: FileSpreadsheet, color: 'text-green-600' },
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_FILES = 10

export function FileUpload({ onAttachmentsChange, attachments, disabled, showPreview = true, customButton }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    // Validate files
    const validFiles = files.filter(file => {
      if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
        alert(`Unsupported file type: ${file.type}`)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`File too large: ${file.name} (max 50MB)`)
        return false
      }
      return true
    })

    if (attachments.length + validFiles.length > MAX_FILES) {
      alert(`Too many files. Maximum ${MAX_FILES} files allowed.`)
      return
    }

    setUploading(true)

    try {
      // Get upload signature
      const sigResponse = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'chat-uploads' })
      })

      if (!sigResponse.ok) {
        throw new Error('Failed to get upload signature')
      }

      const { cloudName, apiKey, timestamp, folder, signature } = await sigResponse.json()

      // Upload files to Cloudinary
      const newAttachments: Attachment[] = []

      for (const file of validFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('folder', folder)
        formData.append('signature', signature)
        
        // For raw files (non-images), use raw resource type
        const resourceType = file.type.startsWith('image/') ? 'image' : 'raw'
        
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: 'POST',
            body: formData
          }
        )

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const uploadResult = await uploadResponse.json()

        const attachment: Attachment = {
          id: uploadResult.public_id,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          mimeType: file.type,
          bytes: uploadResult.bytes,
          secureUrl: uploadResult.secure_url,
          provider: 'cloudinary',
          originalFileName: file.name,
          ...(uploadResult.width && { width: uploadResult.width }),
          ...(uploadResult.height && { height: uploadResult.height }),
        }

        // For non-image files, also upload to Google File API for AI processing
        if (!file.type.startsWith('image/')) {
          try {
            const googleFormData = new FormData()
            googleFormData.append('file', file)
            
            const googleUploadResponse = await fetch('/api/upload/gemini', {
              method: 'POST',
              body: googleFormData
            })
            
            if (googleUploadResponse.ok) {
              const googleResult = await googleUploadResponse.json()
              attachment.googleFileUri = googleResult.file.uri
              attachment.googleFileName = googleResult.file.name
            } else {
              console.warn('Google File API upload failed, file will be processed as description only')
            }
          } catch (error) {
            console.warn('Google File API upload error:', error)
          }
        }

        newAttachments.push(attachment)
      }

      onAttachmentsChange([...attachments, ...newAttachments])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (attachmentId: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== attachmentId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    const fileType = SUPPORTED_FILE_TYPES[mimeType as keyof typeof SUPPORTED_FILE_TYPES]
    return fileType || { icon: File, color: 'text-gray-500' }
  }

  return (
    <div className="space-y-2">
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload Button */}
      {customButton ? (
        <div onClick={() => fileInputRef.current?.click()}>
          {customButton}
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || attachments.length >= MAX_FILES}
          className="cursor-pointer"
        >
          <Paperclip className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Attach'}
        </Button>
      )}

      {/* File Preview Cards - similar to ChatGPT style */}
      {showPreview && (attachments.length > 0 || uploading) && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => {
            const { icon: Icon, color } = getFileIcon(attachment.mimeType)
            const fileName = attachment.originalFileName || attachment.id.split('/').pop() || 'file'
            const fileExtension = attachment.mimeType.split('/')[1]?.toUpperCase() || 'FILE'
            
            return (
              <div
                key={attachment.id}
                className="group relative flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[200px] max-w-[300px]"
              >
                {/* File icon or image thumbnail */}
                <div className="flex-shrink-0">
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.secureUrl}
                      alt="Uploaded"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                  )}
                </div>
                
                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                    {fileName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {fileExtension}
                    {attachment.bytes && ` • ${formatFileSize(attachment.bytes)}`}
                  </div>
                </div>
                
                {/* Remove button - shows on hover */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-gray-600 hover:bg-gray-700 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
          
          {/* Loading indicator for uploading files */}
          {uploading && (
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 min-w-[200px]">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center relative">
                <FileText className="h-6 w-6 text-blue-500" />
                {/* Loading circle overlay */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent border-t-blue-500 animate-spin"></div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  Uploading...
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Processing file
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}