import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { fetchAndExtractText } from '@/lib/websiteParser'

// ─── URL バリデーション ────────────────────────────────────────────────────────

/** プライベート IP・ローカルホスト・非 http(s) を拒否する */
function isAllowedUrl(raw: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return false
  }

  // http / https のみ許可
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

  const host = parsed.hostname.toLowerCase()

  // localhost / loopback
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false

  // IPv4 プライベート範囲
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [, a, b] = ipv4.map(Number)
    if (a === 10) return false                          // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return false  // 172.16.0.0/12
    if (a === 192 && b === 168) return false            // 192.168.0.0/16
    if (a === 169 && b === 254) return false            // リンクローカル
    if (a === 0) return false                           // 0.0.0.0/8
  }

  return true
}

// ─── エンドポイント ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // リクエストボディ取得
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const url = typeof (body as Record<string, unknown>).url === 'string'
    ? ((body as Record<string, unknown>).url as string).trim()
    : ''

  // URL バリデーション
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }
  if (!isAllowedUrl(url)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 400 })
  }

  // HTML 取得・テキスト抽出（失敗しても summary: "" で返す）
  let extractedText = ''
  try {
    extractedText = await fetchAndExtractText(url)
  } catch (err) {
    console.warn('[parse-url] fetch failed:', err)
    return NextResponse.json({ summary: '' })
  }

  if (!extractedText) {
    return NextResponse.json({ summary: '' })
  }

  // LLM で要約（API キーなし / 失敗時は抽出テキストの先頭を返す）
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ summary: extractedText.slice(0, 100) })
  }

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `以下はあるウェブサイトから取得したテキストです。
この会社の事業内容を、日本語で100字以内で簡潔に説明してください。
文末は「〜しています」「〜を行っています」などで終わること。
余計な前置きや説明は不要。事業内容のみ出力してください。

---
${extractedText}
---`,
        },
      ],
    })

    const summary =
      message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    return NextResponse.json({ summary })
  } catch (err) {
    console.warn('[parse-url] LLM summary failed:', err)
    return NextResponse.json({ summary: '' })
  }
}
