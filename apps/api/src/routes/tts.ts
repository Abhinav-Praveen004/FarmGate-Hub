import { Hono } from 'hono';

export const ttsRouter = new Hono();

// Simple in-memory audio cache for instant playback
const audioCache = new Map<string, Buffer>();

function chunkText(text: string, maxLen = 140): string[] {
  const chunks: string[] = [];
  // Split on sentence boundaries (periods, devanagari danda, question marks, commas)
  const segments = text.split(/([।\.\?!,;:\n]+)/);

  let current = '';
  for (const seg of segments) {
    if ((current + seg).length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      current = seg;
    } else {
      current += seg;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, maxLen)];
}

ttsRouter.get('/speak', async (c) => {
  const text = c.req.query('text');
  const lang = (c.req.query('lang') || 'en').toLowerCase();

  if (!text) {
    return c.json({ error: 'Text query parameter is required' }, 400);
  }

  const targetLang = lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en';
  const cacheKey = `${targetLang}:${text}`;

  if (audioCache.has(cacheKey)) {
    const cachedBuffer = audioCache.get(cacheKey)!;
    return new Response(new Uint8Array(cachedBuffer) as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  const chunks = chunkText(text, 140);
  const buffers: Buffer[] = [];

  try {
    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${targetLang}&client=tw-ob`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) {
        throw new Error(`TTS upstream error: ${res.status}`);
      }

      const ab = await res.arrayBuffer();
      buffers.push(Buffer.from(ab));
    }

    if (buffers.length === 0) {
      return c.json({ error: 'No audio generated' }, 500);
    }

    const combined = Buffer.concat(buffers);

    // Cache up to 100 recent audio clips
    if (audioCache.size > 100) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, combined);

    return new Response(new Uint8Array(combined) as any, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message || 'TTS generation failed' }, 502);
  }
});
