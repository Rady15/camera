'use client'

import { useState, useRef } from 'react'
import { Upload, X, ImagePlus, Loader2, Cloud, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  folder?: string
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 5,
  folder = 'securecam/products',
}: ImageUploaderProps) {
  const { toast } = useToast()
  const { token } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      toast({
        title: 'Maximum reached',
        description: `You can only upload up to ${maxImages} images`,
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file',
            description: `${file.name} is not an image`,
            variant: 'destructive',
          })
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds 5MB limit`,
            variant: 'destructive',
          })
          continue
        }

        // Convert to base64
        const base64 = await fileToBase64(file)

        // Upload to Cloudinary
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            image: base64,
            folder,
          }),
        })

        const data = await res.json()

        if (res.ok && data.image?.url) {
          uploadedUrls.push(data.image.url)
        } else {
          toast({
            title: 'Upload failed',
            description: data.error || `Failed to upload ${file.name}`,
            variant: 'destructive',
          })
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls])
        toast({
          title: 'Images uploaded',
          description: `${uploadedUrls.length} image(s) uploaded successfully`,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    const newImages = [...images]
    const [removed] = newImages.splice(from, 1)
    newImages.splice(to, 0, removed)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-700 hover:border-slate-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <p className="text-slate-300">Uploading to Cloudinary...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-slate-800 rounded-full">
              <Cloud className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-white font-medium">Drop images here or click to upload</p>
              <p className="text-slate-400 text-sm mt-1">
                PNG, JPG, WEBP up to 5MB • Max {maxImages} images
              </p>
            </div>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= maxImages}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <Card
              key={index}
              className="relative group bg-slate-800 border-slate-700 overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={url}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => moveImage(index, index - 1)}
                    >
                      ←
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  {index < images.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => moveImage(index, index + 1)}
                    >
                      →
                    </Button>
                  )}
                </div>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded">
                      Primary
                    </span>
                  </div>
                )}

                {/* Image Number */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {index + 1}/{images.length}
                </div>
              </div>
            </Card>
          ))}

          {/* Add More Button */}
          {images.length < maxImages && (
            <Card
              className="border-dashed border-slate-700 cursor-pointer hover:border-emerald-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center">
                  <ImagePlus className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Add more</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        First image will be used as the primary product image. Drag to reorder.
      </p>
    </div>
  )
}
