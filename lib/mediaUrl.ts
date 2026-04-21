function firstSizeUrl(
  sizes: Record<string, { url?: string | null } | undefined> | undefined
): string | null {
  if (!sizes || typeof sizes !== "object") return null;
  for (const key of Object.keys(sizes)) {
    const u = sizes[key]?.url;
    if (typeof u === "string" && u.trim()) return u.trim();
  }
  return null;
}

/**
 * Obtiene una URL usable en el navegador para un documento `media` de Payload
 * (upload / UploadThing). Prioriza `url`, luego `thumbnailURL`, luego cualquier `sizes.*.url`.
 * Si la URL es relativa, la hace absoluta con `siteOrigin` (p. ej. https://tu-dominio).
 */
export function getMediaDisplayUrl(
  media: unknown,
  siteOrigin: string
): string | null {
  if (!media || typeof media !== "object") return null;

  const m = media as {
    url?: string | null;
    thumbnailURL?: string | null;
    sizes?: Record<string, { url?: string | null } | undefined>;
  };

  const fromSizes =
    m.sizes &&
    typeof m.sizes === "object" &&
    m.sizes.thumbnail &&
    typeof m.sizes.thumbnail.url === "string" &&
    m.sizes.thumbnail.url
      ? m.sizes.thumbnail.url.trim()
      : firstSizeUrl(m.sizes);

  const raw =
    (typeof m.url === "string" && m.url.trim()) ||
    (typeof m.thumbnailURL === "string" && m.thumbnailURL.trim()) ||
    fromSizes ||
    null;

  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = siteOrigin.replace(/\/$/, "");
  if (trimmed.startsWith("/") && base) {
    return `${base}${trimmed}`;
  }

  return trimmed;
}
