import { NextRequest, NextResponse } from 'next/server'

const CORS_METHODS = 'GET, POST, PUT, DELETE, OPTIONS'
const CORS_HEADERS = 'Content-Type, Authorization, Accept'

/** Lista de origens permitidas (opcional). Se vazio ou não definido, permite qualquer origem (*). */
function getAllowedOrigins(): string[] | null {
  const raw = process.env.ALLOWED_ORIGINS
  if (!raw || typeof raw !== 'string') return null
  const list = raw.split(',').map((o) => o.trim()).filter(Boolean)
  return list.length > 0 ? list : null
}

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origins = getAllowedOrigins()
  const origin = req.headers.get('origin')
  const allowOrigin =
    origins === null ? '*' : (origin && origins.includes(origin) ? origin : null)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': CORS_METHODS,
    'Access-Control-Allow-Headers': CORS_HEADERS,
  }
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin
  return headers
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/')) return NextResponse.next()

  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: corsHeaders })
  }

  const res = NextResponse.next()
  Object.entries(corsHeaders).forEach(([key, value]) => res.headers.set(key, value))
  return res
}

export const config = {
  matcher: '/api/:path*',
}
