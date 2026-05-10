import { NextRequest, NextResponse } from 'next/server'
import { generateSessionToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 })
  }

  const password = (body.password ?? '').trim()
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD

  if (!expected) {
    console.error('[admin/login] ADMIN_DASHBOARD_PASSWORD が設定されていません')
    return NextResponse.json({ error: 'サーバー設定エラーです' }, { status: 500 })
  }

  if (password !== expected) {
    return NextResponse.json({ error: 'パスワードが正しくありません' }, { status: 401 })
  }

  const token = generateSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}
