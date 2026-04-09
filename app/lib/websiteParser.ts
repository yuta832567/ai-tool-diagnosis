/**
 * websiteParser.ts
 * URL から HTML を取得し、事業内容推定に使えるテキストを抽出する。
 * 精度より落ちにくさを優先したシンプル実装。
 */

const FETCH_TIMEOUT_MS = 8000
const MAX_BODY_CHARS = 1000
const MAX_TOTAL_CHARS = 1500

/** HTML から title・meta description・本文テキストを抽出して返す */
export function extractTextFromHtml(html: string): string {
  // script / style / コメントを除去
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  // title
  const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : ''

  // meta description（属性順序が前後する両パターン）
  const metaMatch =
    cleaned.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i) ??
    cleaned.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i)
  const metaDesc = metaMatch ? decodeHtmlEntities(metaMatch[1].trim()) : ''

  // body の本文テキスト（タグを空白に置換 → 連続空白を1つに正規化）
  const bodyMatch = cleaned.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)
  const bodyRaw = bodyMatch ? bodyMatch[1] : cleaned
  const bodyText = bodyRaw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = [title, metaDesc, bodyText.slice(0, MAX_BODY_CHARS)].filter(Boolean)
  return parts.join('\n').slice(0, MAX_TOTAL_CHARS)
}

/** 主要な HTML エンティティをデコード */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/** URL から HTML を取得してテキストを抽出する（サーバーサイド専用） */
export async function fetchAndExtractText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SiteAnalyzerBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ja,en',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
    throw new Error(`Unexpected content-type: ${contentType}`)
  }

  const html = await res.text()
  return extractTextFromHtml(html)
}
