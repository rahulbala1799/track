import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // First, check if we can make any HTTP request at all
    const testResponse = await fetch('https://httpbin.org/json', {
      method: 'GET',
      timeout: 10000,
    })
    
    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: 'Cannot make basic HTTP requests',
        status: testResponse.status 
      })
    }

    // Check environment
    const hasApiKey = !!process.env.OPENAI_API_KEY
    const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 20) || 'none'
    
    // Try direct OpenAI API call without SDK
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    const result = await openaiResponse.json()

    return NextResponse.json({
      success: true,
      basicHttp: 'working',
      hasApiKey,
      keyPrefix,
      openaiStatus: openaiResponse.status,
      openaiResponse: openaiResponse.ok ? 'API accessible' : result,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}