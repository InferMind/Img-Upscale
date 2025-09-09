import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

// Configure route segment for longer processing
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const scaleFactor = Number.parseInt(formData.get("scaleFactor") as string) || 4

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Maximum 10MB allowed." }, { status: 400 })
    }

    // Build form-data to forward to Python backend
    const proxyForm = new FormData()
    proxyForm.append("image", file)
    proxyForm.append("scaleFactor", String(scaleFactor))
    const model = (formData.get("model") as string) || "x4plus"
    const faceEnhance = (formData.get("faceEnhance") as string) || "false"
    proxyForm.append("model", model)
    proxyForm.append("faceEnhance", faceEnhance)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minutes

    const resp = await fetch(`${BACKEND_URL}/api/enhance`, {
      method: "POST",
      body: proxyForm as any,
      signal: controller.signal,
      headers: {
        'Connection': 'keep-alive',
      },
    })

    clearTimeout(timeoutId)

    if (!resp.ok) {
      const err = await safeJson(resp)
      const message = (err && (err.error || err.detail)) || `Backend error: ${resp.status}`
      return NextResponse.json({ error: message }, { status: resp.status })
    }

    const backendJson = await resp.json()

    // Ensure the frontend gets a consistent shape
    return NextResponse.json({
      success: true,
      originalSize: file.size,
      enhancedImage: backendJson.enhancedImage,
      scaleFactor,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Proxy error:", error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: "Request timeout. Image processing took too long." }, { status: 408 })
    }
    return NextResponse.json({ error: "Failed to process image. Please try again." }, { status: 500 })
  }
}

async function safeJson(r: Response): Promise<any | null> {
  try {
    return await r.json()
  } catch {
    return null
  }
}
