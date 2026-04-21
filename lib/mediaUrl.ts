/**
 * Obtiene una URL usable en el navegador para un documento `media` de Payload
 * (upload / UploadThing). Prioriza `url`, luego `thumbnailURL`, luego miniatura.
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

  const raw =
    (typeof m.url === "string" && m.url) ||
    (typeof m.thumbnailURL === "string" && m.thumbnailURL) ||
    (m.sizes &&
      typeof m.sizes === "object" &&
      m.sizes.thumbnail &&
      typeof m.sizes.thumbnail.url === "string" &&
      m.sizes.thumbnail.url) ||
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
