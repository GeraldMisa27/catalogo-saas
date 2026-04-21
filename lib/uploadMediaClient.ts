"use client";

export async function uploadMediaForProduct(
  file: File,
  alt: string
): Promise<string> {
  const altText = alt.trim() || "Imagen de producto";

  const formData = new FormData();
  formData.append("_payload", JSON.stringify({ alt: altText }));
  formData.append("file", file, file.name);

  const res = await fetch("/api/media", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const d = data as { errors?: { message?: string }[]; message?: string };
    throw new Error(
      d.errors?.[0]?.message ?? d.message ?? "Error al subir la imagen"
    );
  }

  const data = (await res.json()) as { doc?: { id: string }; id?: string };
  const id = data.doc?.id ?? data.id;
  if (!id) throw new Error("Respuesta inválida al crear el medio");
  return id;
}
