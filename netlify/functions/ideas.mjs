// Private idea store, shared across all of Pepper's devices.
// Data lives in a single Netlify Blob (JSON array); every request must carry
// the shared passcode in the `x-ideas-key` header, checked against the
// IDEAS_PASSCODE env var. No passcode -> 401, so the ideas stay private.
//
//   GET    /.netlify/functions/ideas         -> list every star
//   POST   /.netlify/functions/ideas {text}  -> add a star (server fixes look)
//   DELETE /.netlify/functions/ideas?id=…    -> remove a star
import { getStore } from '@netlify/blobs'

const KEY = 'list'

export default async (req) => {
  const secret = process.env.IDEAS_PASSCODE || ''
  const provided = req.headers.get('x-ideas-key') || ''
  // constant-ish check; also refuse if no server secret is configured
  if (!secret || provided !== secret) return json({ error: 'unauthorized' }, 401)

  // strong consistency so a write is immediately visible to the next read
  // (delete/add reflect right away, even on reload or another device)
  const store = getStore({ name: 'ideas', consistency: 'strong' })
  const list = (await store.get(KEY, { type: 'json' })) || []

  if (req.method === 'GET') return json(list)

  if (req.method === 'POST') {
    const body = await req.json().catch(() => null)
    const text = String(body?.text ?? '').trim().slice(0, 140)
    if (!text) return json({ error: 'empty' }, 400)
    // the star's position, size, twinkle and colour are fixed here so the
    // constellation looks identical on every device
    const star = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      date: Date.now(),
      x: +(6 + Math.random() * 88).toFixed(2),
      y: +(8 + Math.random() * 80).toFixed(2),
      s: +(3 + Math.random() * 5).toFixed(1),
      tw: +(2 + Math.random() * 3).toFixed(1),
      d: +(Math.random() * 3).toFixed(1),
      h: Math.floor(Math.random() * 360),
    }
    list.push(star)
    await store.setJSON(KEY, list)
    return json(star, 201)
  }

  if (req.method === 'DELETE') {
    const id = new URL(req.url).searchParams.get('id')
    await store.setJSON(KEY, list.filter((i) => i.id !== id))
    return json({ ok: true })
  }

  return json({ error: 'method not allowed' }, 405)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
