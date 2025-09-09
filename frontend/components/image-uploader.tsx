"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, ImageIcon, Zap, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  onImageSelect: (file: File, scaleFactor: number, model: "x4plus" | "anime6B", faceEnhance: boolean) => void
  isProcessing?: boolean
}

export function ImageUploader({ onImageSelect, isProcessing = false }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scaleFactor, setScaleFactor] = useState<number>(4)
  const [model, setModel] = useState<"x4plus" | "anime6B">("x4plus")
  const [faceEnhance, setFaceEnhance] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG, WEBP)")
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEnhance = () => {
    if (selectedFile) {
      onImageSelect(selectedFile, scaleFactor, model, faceEnhance)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {!selectedFile ? (
        // Upload Area
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-300 cursor-pointer group relative overflow-hidden",
            dragActive ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50",
            isProcessing && "pointer-events-none opacity-50",
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="p-12 text-center space-y-4 relative z-10">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
              <Upload className="h-8 w-8 text-primary group-hover:animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {dragActive ? "Drop your image here" : "Upload your image"}
              </h3>
              <p className="text-muted-foreground">Drag and drop or click to select • JPG, PNG, WEBP up to 10MB</p>
            </div>
            <Button
              variant="outline"
              className="mt-4 group-hover:border-primary group-hover:text-primary transition-all duration-300 bg-transparent"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose File
            </Button>
          </div>
        </Card>
      ) : (
        // Preview Area
        <div className="space-y-6">
          <Card className="p-6 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-primary/5" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Image Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  disabled={isProcessing}
                  className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {previewUrl && (
                <div className="relative bg-muted rounded-lg overflow-hidden group">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
            </div>
          </Card>

          {/* Scale Factor Selection */}
          <Card className="p-6 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-accent/5" />

            <div className="relative z-10">
              <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Enhancement Options
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Upscale Factor</label>
                  <div className="flex gap-3">
                    <Button
                      variant={scaleFactor === 2 ? "default" : "outline"}
                      onClick={() => setScaleFactor(2)}
                      disabled={isProcessing}
                      className="flex-1 transition-all duration-200 hover:scale-105"
                    >
                      2x Enhancement
                    </Button>
                    <Button
                      variant={scaleFactor === 4 ? "default" : "outline"}
                      onClick={() => setScaleFactor(4)}
                      disabled={isProcessing}
                      className="flex-1 transition-all duration-200 hover:scale-105"
                    >
                      4x Enhancement
                    </Button>
                    <Button
                      variant={scaleFactor === 6 ? "default" : "outline"}
                      onClick={() => setScaleFactor(6)}
                      disabled={isProcessing}
                      className="flex-1 transition-all duration-200 hover:scale-105"
                    >
                      6x Enhancement
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Model</label>
                  <div className="flex gap-3">
                    <Button
                      variant={model === "x4plus" ? "default" : "outline"}
                      onClick={() => setModel("x4plus")}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      RealESRGAN_x4plus
                    </Button>
                    <Button
                      variant={model === "anime6B" ? "default" : "outline"}
                      onClick={() => setModel("anime6B")}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      x4plus_anime_6B
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="faceEnhance"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={faceEnhance}
                    onChange={(e) => setFaceEnhance(e.target.checked)}
                    disabled={isProcessing}
                  />
                  <label htmlFor="faceEnhance" className="text-sm text-foreground">
                    Enhance faces (GFPGAN)
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Ready to enhance</p>
                    <p className="text-xs text-muted-foreground">Output will be {scaleFactor}x larger than original</p>
                  </div>
                  <Button
                    onClick={handleEnhance}
                    disabled={isProcessing}
                    className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Zap className="mr-2 h-4 w-4 relative z-10 group-hover:animate-pulse" />
                    <span className="relative z-10">{isProcessing ? "Processing..." : "Enhance Image"}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
    </div>
  )
}
