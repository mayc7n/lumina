import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('lumina_access') || request.cookies.has('lumina_refresh')

  if (pathname.startsWith('/dashboard') && !hasSession) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (hasSession && PUBLIC_AUTH_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
