export interface ProcessingResult {
  success: boolean
  originalSize: number
  enhancedImage: string
  scaleFactor: number
  processedAt: string
  error?: string
}

export interface ProcessingProgress {
  stage: "uploading" | "processing" | "finalizing" | "complete" | "error"
  progress: number
  message: string
}

export async function enhanceImage(
  file: File,
  scaleFactor: number,
  model: "x4plus" | "anime6B",
  faceEnhance: boolean,
  onProgress?: (progress: ProcessingProgress) => void,
): Promise<ProcessingResult> {
  try {
    // Stage 1: Uploading
    onProgress?.({
      stage: "uploading",
      progress: 10,
      message: "Uploading image...",
    })

    const formData = new FormData()
    formData.append("image", file)
    formData.append("scaleFactor", scaleFactor.toString())
    formData.append("model", model)
    formData.append("faceEnhance", faceEnhance ? "true" : "false")

    // Stage 2: Processing
    onProgress?.({
      stage: "processing",
      progress: 30,
      message: "AI is enhancing your image...",
    })

    const response = await fetch("/api/enhance", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to process image")
    }

    // Stage 3: Finalizing
    onProgress?.({
      stage: "finalizing",
      progress: 90,
      message: "Finalizing enhancement...",
    })

    const result = await response.json()

    // Stage 4: Complete
    onProgress?.({
      stage: "complete",
      progress: 100,
      message: "Enhancement complete!",
    })

    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    onProgress?.({
      stage: "error",
      progress: 0,
      message: errorMessage,
    })

    return {
      success: false,
      error: errorMessage,
      originalSize: file.size,
      enhancedImage: "",
      scaleFactor,
      processedAt: new Date().toISOString(),
    }
  }
}

export function downloadImage(dataUrl: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
