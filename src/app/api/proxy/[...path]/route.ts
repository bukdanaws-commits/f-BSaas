import { NextRequest, NextResponse } from 'next/server'

const API_URL = 'http://localhost:8080'

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT')
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE')
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH')
}

async function proxyRequest(request: NextRequest, method: string) {
  const path = request.nextUrl.pathname.replace('/api/proxy', '')
  const searchParams = request.nextUrl.searchParams
  const targetUrl = `${API_URL}${path}?${searchParams.toString()}`
  
  try {
    const headers: HeadersInit = {}
    
    // Forward authorization header
    const authHeader = request.headers.get('Authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward content-type for POST/PUT/PATCH
    const contentType = request.headers.get('Content-Type')
    if (contentType) {
      headers['Content-Type'] = contentType
    }
    
    const fetchOptions: RequestInit = {
      method,
      headers,
    }
    
    // Forward body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = await request.text()
    }
    
    const response = await fetch(targetUrl, fetchOptions)
    const data = await response.text()
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Proxy error: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
