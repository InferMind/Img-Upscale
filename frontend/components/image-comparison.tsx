"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, RotateCcw } from "lucide-react"

interface ImageComparisonProps {
  originalFile: File
  enhancedImage: string
  scaleFactor: number
  originalSize: number
  processedAt: string
  onDownload: () => void
  onTryAnother: () => void
}

export function ImageComparison({
  originalFile,
  enhancedImage,
  scaleFactor,
  originalSize,
  processedAt,
  onDownload,
  onTryAnother,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<"comparison" | "original" | "enhanced">("comparison")
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)

  // Create URL for original image
  useEffect(() => {
    const url = URL.createObjectURL(originalFile)
    setOriginalImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [originalFile])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updateSliderPosition = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const resetSlider = () => {
    setSliderPosition(50)
  }

  const getImageDimensions = async (imageUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = imageUrl
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-8">
      {/* View Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "comparison" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("comparison")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Compare
          </Button>
          <Button
            variant={viewMode === "original" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("original")}
          >
            Original
          </Button>
          <Button
            variant={viewMode === "enhanced" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("enhanced")}
          >
            Enhanced
          </Button>
        </div>

        {viewMode === "comparison" && (
          <Button variant="ghost" size="sm" onClick={resetSlider}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Image Comparison Container */}
      <Card className="overflow-hidden">
        <div className="relative">
          {viewMode === "comparison" ? (
            <div
              ref={containerRef}
              className="relative aspect-auto cursor-col-resize select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Enhanced Image (Background) */}
              <div className="relative">
                <img
                  src={enhancedImage || "/placeholder.svg"}
                  alt="Enhanced image"
                  className="w-full h-auto block"
                  draggable={false}
                />
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  Enhanced {scaleFactor}x
                </Badge>
              </div>

              {/* Original Image (Overlay) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={originalImageUrl || "/placeholder.svg"}
                  alt="Original image"
                  className="w-full h-auto block"
                  draggable={false}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "auto",
                  }}
                />
                <Badge className="absolute top-4 left-4 bg-muted text-muted-foreground">Original</Badge>
              </div>

              {/* Slider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 cursor-col-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-1 h-4 bg-gray-400 rounded-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={viewMode === "original" ? originalImageUrl : enhancedImage || "/placeholder.svg"}
                alt={viewMode === "original" ? "Original image" : "Enhanced image"}
                className="w-full h-auto block"
              />
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                {viewMode === "original" ? "Original" : `Enhanced ${scaleFactor}x`}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Image Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Original Image</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Filename:</span>
              <span className="text-foreground font-medium truncate ml-2">{originalFile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">File Size:</span>
              <span className="text-foreground font-medium">{formatFileSize(originalSize)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Format:</span>
              <span className="text-foreground font-medium">{originalFile.type.split("/")[1].toUpperCase()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Enhanced Image</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Enhancement:</span>
              <span className="text-foreground font-medium">{scaleFactor}x Upscaling</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technology:</span>
              <span className="text-foreground font-medium">Real-ESRGAN</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Processed:</span>
              <span className="text-foreground font-medium">{new Date(processedAt).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onDownload} size="lg" className="bg-primary hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" />
          Download Enhanced Image
        </Button>
        <Button onClick={onTryAnother} variant="outline" size="lg">
          Try Another Image
        </Button>
      </div>

      {/* Usage Instructions */}
      {viewMode === "comparison" && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Tip:</strong> Drag the slider or click anywhere on the image to compare before and after results
          </p>
        </Card>
      )}
    </div>
  )
}
