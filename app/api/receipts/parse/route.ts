import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parseReceiptWithAI } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 4MB for OpenAI Vision API)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Max 4MB allowed for AI processing.' }, { status: 400 })
    }

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')

    // Parse receipt with OpenAI
    const parsedReceipt = await parseReceiptWithAI(base64Image, file.type)

    return NextResponse.json(parsedReceipt)
  } catch (error) {
    console.error('Error parsing receipt:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse receipt' },
      { status: 500 }
    )
  }
}