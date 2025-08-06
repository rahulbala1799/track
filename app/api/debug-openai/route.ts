import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debug: Starting network test...')
    
    // Test multiple endpoints
    const tests = []
    
    // Test 1: Simple HTTP
    try {
      const httpTest = await fetch('http://httpbin.org/json')
      tests.push({ name: 'HTTP', status: httpTest.status, ok: httpTest.ok })
    } catch (e) {
      tests.push({ name: 'HTTP', error: e instanceof Error ? e.message : 'Failed' })
    }
    
    // Test 2: HTTPS
    try {
      const httpsTest = await fetch('https://httpbin.org/json')
      tests.push({ name: 'HTTPS', status: httpsTest.status, ok: httpsTest.ok })
    } catch (e) {
      tests.push({ name: 'HTTPS', error: e instanceof Error ? e.message : 'Failed' })
    }
    
    // Test 3: Google (different server)
    try {
      const googleTest = await fetch('https://www.google.com', { method: 'HEAD' })
      tests.push({ name: 'Google', status: googleTest.status, ok: googleTest.ok })
    } catch (e) {
      tests.push({ name: 'Google', error: e instanceof Error ? e.message : 'Failed' })
    }

    // Test 4: OpenAI API
    const hasApiKey = !!process.env.OPENAI_API_KEY
    const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 20) || 'none'
    
    try {
      const openaiTest = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      const openaiResult = await openaiTest.json()
      tests.push({ 
        name: 'OpenAI', 
        status: openaiTest.status, 
        ok: openaiTest.ok,
        response: openaiTest.ok ? 'Success' : openaiResult 
      })
    } catch (e) {
      tests.push({ name: 'OpenAI', error: e instanceof Error ? e.message : 'Failed' })
    }

    return NextResponse.json({
      networkTests: tests,
      environment: {
        hasApiKey,
        keyPrefix,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        vercelRegion: process.env.VERCEL_REGION,
      },
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