/** Normalización alineada con la API de búsqueda (tildes, minúsculas). */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }
  return dp[m]![n]!;
}

/**
 * Puntuación 0–1: combina Levenshtein, palabras en común y subcadenas.
 * Pensado para nombres cortos (negocios / productos).
 */
export function relatednessScore(query: string, text: string): number {
  const q = normalizeForSearch(query);
  const t = normalizeForSearch(text);
  if (!q.length || !t.length) return 0;
  if (t.includes(q)) return 1;

  const maxLen = Math.max(q.length, t.length);
  const levDist = levenshtein(q, t);
  const levRatio = 1 - levDist / maxLen;

  const qWords = q.split(/\s+/).filter((w) => w.length >= 2);
  const tTokens = t.split(/\s+/);
  let overlap = 0;
  for (const w of qWords) {
    if (tTokens.some((tw) => tw.includes(w) || w.includes(tw))) overlap++;
  }
  const wordScore = qWords.length ? overlap / qWords.length : 0;

  let bestSub = 0;
  const maxSub = Math.min(q.length, t.length);
  for (let len = maxSub; len >= 1; len--) {
    for (let i = 0; i + len <= q.length; i++) {
      const sub = q.slice(i, i + len);
      if (t.includes(sub)) {
        bestSub = Math.max(bestSub, len / maxLen);
        break;
      }
    }
  }

  return Math.max(levRatio * 0.95, wordScore * 0.9, bestSub * 0.88);
}
