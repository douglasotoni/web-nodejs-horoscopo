import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rotas admin requerem role admin ou editor
    if (path.startsWith('/admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      const role = token.role as string
      if (path.startsWith('/admin/users') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      
      if (path.startsWith('/admin/predictions') && role !== 'admin' && role !== 'editor') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Rotas públicas
        if (path === '/login' || path === '/') {
          return true
        }
        
        // Rotas privadas requerem autenticação
        if (path.startsWith('/dashboard') || path.startsWith('/predictions') || path.startsWith('/admin')) {
          return !!token
        }
        
        return true
      }
    }
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/predictions/:path*', '/admin/:path*']
}

