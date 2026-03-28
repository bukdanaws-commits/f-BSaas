import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Allowed file types for upload
const ALLOWED_TYPES: Record<string, string[]> = {
  banner: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  photo: ['image/jpeg', 'image/png', 'image/webp'],
}

// Max file size (5MB for banners, 2MB for photos)
const MAX_SIZES: Record<string, number> = {
  banner: 5 * 1024 * 1024, // 5MB
  photo: 2 * 1024 * 1024,  // 2MB
}

// Generate unique filename
function generateFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName).toLowerCase()
  return `${prefix}${timestamp}-${randomStr}${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'banner'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[type] || ALLOWED_TYPES.banner
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = MAX_SIZES[type] || MAX_SIZES.banner
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      )
    }

    // Determine upload directory based on type
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type === 'banner' ? 'banners' : 'photos')
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const filename = generateFilename(file.name, type === 'banner' ? 'banner-' : 'photo-')
    const filepath = path.join(uploadDir, filename)

    // Convert File to ArrayBuffer and then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Write file to disk
    await writeFile(filepath, buffer)

    // Return public URL
    const publicUrl = `/uploads/${type === 'banner' ? 'banners' : 'photos'}/${filename}`

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename,
        size: file.size,
        type: file.type,
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// DELETE endpoint to remove uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'No file URL provided' },
        { status: 400 }
      )
    }

    // Security: Only allow deleting files from uploads directory
    if (!url.startsWith('/uploads/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 400 }
      )
    }

    const filepath = path.join(process.cwd(), 'public', url)
    
    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete file
    await unlink(filepath)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
