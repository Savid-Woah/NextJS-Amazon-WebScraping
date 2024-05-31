import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/register')) {
    const token = req.cookies.get('token')
    if (token) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (pathname.startsWith('/login')) {
    const token = req.cookies.get('token')
    if (!token) {
      const tokenFromUrl = req.nextUrl.searchParams.get('token')
      if (tokenFromUrl) {
        const res = NextResponse.redirect(new URL('/', req.url))
        res.cookies.set('token', tokenFromUrl, {
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7
        })
        return res
      }
    }
    if (token) return NextResponse.redirect(new URL('/', req.url))
    return NextResponse.next()
  }

  if (pathname === '/') {
    const token = req.cookies.get('token')
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }
}
export const config = {
  matcher: ['/login', '/register', '/']
}
