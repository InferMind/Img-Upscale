"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageUploader } from "@/components/image-uploader"
import { ImageComparison } from "@/components/image-comparison"
import { AnimatedBackground } from "@/components/animated-background"
import { PageTransition, FadeIn, SlideIn, ScaleIn } from "@/components/page-transition"
import { enhanceImage, downloadImage, type ProcessingResult, type ProcessingProgress } from "@/lib/image-processing"
import { Upload, Zap, Download, ArrowRight, ArrowLeft, AlertCircle, Sparkles } from "lucide-react"

type AppState = "landing" | "upload" | "processing" | "results" | "error"

export default function HomePage() {
  const [currentState, setCurrentState] = useState<AppState>("landing")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scaleFactor, setScaleFactor] = useState<number>(4)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null)
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = async (
    file: File,
    scale: number,
    model: "x4plus" | "anime6B",
    faceEnhance: boolean,
  ) => {
    setSelectedFile(file)
    setScaleFactor(scale)
    setCurrentState("processing")
    setError(null)
    setProcessingResult(null)

    try {
      const result = await enhanceImage(file, scale, model, faceEnhance, (progress) => {
        setProcessingProgress(progress)
      })

      if (result.success) {
        setProcessingResult(result)
        setCurrentState("results")
      } else {
        setError(result.error || "Processing failed")
        setCurrentState("error")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setCurrentState("error")
    }
  }

  const resetToLanding = () => {
    setCurrentState("landing")
    setSelectedFile(null)
    setScaleFactor(4)
    setProcessingProgress(null)
    setProcessingResult(null)
    setError(null)
  }

  const goToUpload = () => {
    setCurrentState("upload")
  }

  const handleDownload = () => {
    if (processingResult?.enhancedImage && selectedFile) {
      const filename = `enhanced_${scaleFactor}x_${selectedFile.name}`
      downloadImage(processingResult.enhancedImage, filename)
    }
  }

  if (currentState === "upload") {
    return (
      <PageTransition className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <FadeIn className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={resetToLanding}
              className="mb-6 hover:bg-primary/10 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Upload Your Image</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select an image to enhance with AI-powered upscaling technology
            </p>
          </FadeIn>

          {/* Upload Interface */}
          <ScaleIn delay={0.2}>
            <ImageUploader onImageSelect={handleImageSelect} isProcessing={currentState === "processing"} />
          </ScaleIn>
        </div>
      </PageTransition>
    )
  }

  if (currentState === "processing") {
    return (
      <PageTransition className="min-h-screen bg-background flex items-center justify-center">
        <ScaleIn>
          <Card className="p-12 text-center max-w-md mx-auto relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Zap className="h-8 w-8 text-primary animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Enhancing Your Image</h2>
              <p className="text-muted-foreground mb-6">
                {processingProgress?.message || "Our AI is working its magic using Real-ESRGAN technology..."}
              </p>
              <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 relative"
                  style={{ width: `${processingProgress?.progress || 0}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-spin" />
                {processingProgress?.progress || 0}% complete
              </p>
            </div>
          </Card>
        </ScaleIn>
      </PageTransition>
    )
  }

  if (currentState === "error") {
    return (
      <PageTransition className="min-h-screen bg-background flex items-center justify-center">
        <ScaleIn>
          <Card className="p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-destructive animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Processing Failed</h2>
            <p className="text-muted-foreground mb-6">
              {error || "An unexpected error occurred while processing your image."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setCurrentState("upload")}
                variant="outline"
                className="hover:bg-primary/10 transition-colors duration-200"
              >
                Try Again
              </Button>
              <Button onClick={resetToLanding} className="hover:scale-105 transition-transform duration-200">
                Back to Home
              </Button>
            </div>
          </Card>
        </ScaleIn>
      </PageTransition>
    )
  }

  if (currentState === "results") {
    return (
      <PageTransition className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <FadeIn className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={resetToLanding}
              className="mb-6 hover:bg-primary/10 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              Enhancement Complete!
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </h1>
            <p className="text-lg text-muted-foreground">
              Your image has been enhanced {scaleFactor}x using AI technology
            </p>
          </FadeIn>

          {processingResult?.enhancedImage && selectedFile ? (
            <SlideIn direction="up" delay={0.2}>
              <ImageComparison
                originalFile={selectedFile}
                enhancedImage={processingResult.enhancedImage}
                scaleFactor={scaleFactor}
                originalSize={processingResult.originalSize}
                processedAt={processingResult.processedAt}
                onDownload={handleDownload}
                onTryAnother={resetToLanding}
              />
            </SlideIn>
          ) : (
            <ScaleIn delay={0.2} className="text-center">
              <Card className="p-8">
                <p className="text-muted-foreground mb-4">No results to display</p>
                <Button onClick={resetToLanding}>Back to Home</Button>
              </Card>
            </ScaleIn>
          )}
        </div>
      </PageTransition>
    )
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-card to-background" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.png')] opacity-5 bg-cover bg-center" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center space-y-8">
            {/* Main Headline */}
            <FadeIn className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
                AI Image Upscaler
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground font-medium flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                Powered by Real-ESRGAN
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </p>
            </FadeIn>

            {/* Subheadline */}
            <FadeIn delay={0.2}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                Transform your low-resolution images into stunning high-quality masterpieces with cutting-edge AI
                technology. Upload, enhance, and download in seconds.
              </p>
            </FadeIn>

            {/* CTA Button */}
            <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={goToUpload}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Upload className="mr-2 h-5 w-5 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">Start Enhancing</span>
                <ArrowRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
              <p className="text-sm text-muted-foreground">No signup required • Free to use</p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 relative" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your images with AI-powered enhancement
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <SlideIn direction="left" delay={0.2}>
              <Card className="p-8 text-center border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <Upload className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">1. Upload</h3>
                <p className="text-muted-foreground">
                  Drag and drop your image or click to select. Supports JPG, PNG, and WEBP up to 10MB.
                </p>
              </Card>
            </SlideIn>

            {/* Step 2 */}
            <SlideIn direction="up" delay={0.4}>
              <Card className="p-8 text-center border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                  <Zap className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">2. Enhance</h3>
                <p className="text-muted-foreground">
                  Our AI processes your image using Real-ESRGAN technology. Choose 2x or 4x upscaling.
                </p>
              </Card>
            </SlideIn>

            {/* Step 3 */}
            <SlideIn direction="right" delay={0.6}>
              <Card className="p-8 text-center border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/20 transition-colors duration-300">
                  <Download className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-4">3. Download</h3>
                <p className="text-muted-foreground">
                  Compare before and after results, then download your enhanced image in high quality.
                </p>
              </Card>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border relative" style={{ zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center">
            <p className="text-muted-foreground">Built with Next.js and Real-ESRGAN • Enhanced by AI</p>
          </FadeIn>
        </div>
      </footer>
    </div>
  )
}
