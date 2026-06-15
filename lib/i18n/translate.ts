import { createHash } from 'crypto';
import { createServiceClient } from '@/lib/supabase/server';

// Servicio de traducción automática con caché en Supabase.
//
// Fuente = español. Objetivo = 'en' | 'fr'. Cada texto se traduce una sola vez
// y se guarda en `translation_cache`. Motor por defecto: MyMemory (gratis, sin
// API key). Si existe DEEPL_API_KEY se usa DeepL (mejor calidad). Ante cualquier
// fallo del motor, se devuelve el texto original en español (nunca rompe).

export type TargetLang = 'en' | 'fr';

const md5 = (s: string) => createHash('md5').update(s).digest('hex');

// ── Motores ────────────────────────────────────────────────────────────────

async function translateWithDeepL(texts: string[], target: TargetLang): Promise<(string | null)[]> {
  const key = process.env.DEEPL_API_KEY;
  if (!key) return texts.map(() => null);
  const host = key.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
  const body = new URLSearchParams();
  texts.forEach((t) => body.append('text', t));
  body.append('source_lang', 'ES');
  body.append('target_lang', target.toUpperCase());
  try {
    const res = await fetch(`https://${host}/v2/translate`, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return texts.map(() => null);
    const data = (await res.json()) as { translations?: { text: string }[] };
    return texts.map((_, i) => data.translations?.[i]?.text ?? null);
  } catch {
    return texts.map(() => null);
  }
}

async function translateOneMyMemory(text: string, target: TargetLang): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|${target}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { responseStatus?: number; responseData?: { translatedText?: string } };
    if (data.responseStatus !== 200) return null;
    return data.responseData?.translatedText ?? null;
  } catch {
    return null;
  }
}

async function translateWithEngine(texts: string[], target: TargetLang): Promise<(string | null)[]> {
  if (process.env.DEEPL_API_KEY) return translateWithDeepL(texts, target);
  // MyMemory traduce de a uno; limitamos concurrencia para no saturar.
  const out: (string | null)[] = [];
  for (const text of texts) {
    out.push(await translateOneMyMemory(text, target));
  }
  return out;
}

// ── API pública ──────────────────────────────────────────────────────────────

/**
 * Traduce un lote de textos en español al idioma objetivo, usando caché.
 * Devuelve un array alineado con `texts`. Los textos que no se puedan traducir
 * (motor caído, etc.) vuelven en español.
 */
export async function translateBatch(texts: string[], target: TargetLang): Promise<string[]> {
  const clean = texts.map((t) => (typeof t === 'string' ? t : ''));
  const result = [...clean];
  if (target !== 'en' && target !== 'fr') return result;

  // Índices únicos no vacíos a traducir.
  const uniques = new Map<string, number[]>(); // text -> posiciones
  clean.forEach((t, i) => {
    if (!t.trim()) return;
    const arr = uniques.get(t) ?? [];
    arr.push(i);
    uniques.set(t, arr);
  });
  if (uniques.size === 0) return result;

  const supabase = createServiceClient();
  const entries = [...uniques.keys()].map((text) => ({ text, hash: md5(text) }));
  const hashes = entries.map((e) => e.hash);

  // 1) Cache hits.
  const cached = new Map<string, string>();
  const { data } = await supabase
    .from('translation_cache')
    .select('source_hash, translated_text')
    .eq('target_lang', target)
    .in('source_hash', hashes);
  for (const row of data ?? []) cached.set(row.source_hash, row.translated_text);

  // 2) Misses -> traducir con motor.
  const misses = entries.filter((e) => !cached.has(e.hash));
  if (misses.length > 0) {
    const translated = await translateWithEngine(misses.map((m) => m.text), target);
    const toUpsert: { source_hash: string; target_lang: string; source_text: string; translated_text: string }[] = [];
    misses.forEach((m, i) => {
      const tr = translated[i];
      if (tr && tr.trim()) {
        cached.set(m.hash, tr);
        toUpsert.push({ source_hash: m.hash, target_lang: target, source_text: m.text, translated_text: tr });
      }
    });
    if (toUpsert.length > 0) {
      await supabase.from('translation_cache').upsert(toUpsert, { onConflict: 'source_hash,target_lang' });
    }
  }

  // 3) Reensamblar.
  for (const { text, hash } of entries) {
    const tr = cached.get(hash);
    if (tr) for (const pos of uniques.get(text)!) result[pos] = tr;
  }
  return result;
}
