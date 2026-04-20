/**
 * Sube un archivo a la colección `media` (Payload REST).
 * Solo usar en componentes cliente (`"use client"`).
 */
export async function uploadMediaForProduct(
  file: File,
  alt: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("alt", alt.trim() || "Imagen de producto");

  const res = await fetch("/api/media", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      errors?: { message?: string }[];
      message?: string;
    };
    const msg =
      data.errors?.[0]?.message ?? data.message ?? "Error al subir la imagen";
    throw new Error(msg);
  }

  const data = (await res.json()) as { doc?: { id: string }; id?: string };
  const id = data.doc?.id ?? data.id;
  if (!id) throw new Error("Respuesta inválida al subir la imagen");
  return id;
}
