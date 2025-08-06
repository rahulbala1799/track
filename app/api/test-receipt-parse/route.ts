import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    console.log('Testing OpenAI SDK directly...')
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 45000,
      maxRetries: 1,
      baseURL: 'https://api.openai.com/v1',
      defaultHeaders: {
        'User-Agent': 'Receipt-Tracker/1.0',
      },
    })

    // Create a simple test image (1x1 red pixel)
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

    console.log('Making OpenAI vision request...')
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "What color is this image? Respond with just the color name." },
          { 
            type: "image_url", 
            image_url: { url: `data:image/png;base64,${testImage}` }
          }
        ]
      }],
      max_tokens: 10
    })

    console.log('OpenAI response received:', response.choices[0]?.message?.content)

    return NextResponse.json({
      success: true,
      response: response.choices[0]?.message?.content,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('OpenAI SDK error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}