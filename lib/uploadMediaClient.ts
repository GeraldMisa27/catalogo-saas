"use client";

async function createMediaDoc(file: File, altText: string): Promise<string> {
  const formData = new FormData();
  formData.append("_payload", JSON.stringify({ alt: altText }));
  formData.append("file", file, file.name); // archivo real

  const res = await fetch("/api/media", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const d = data as { errors?: { message?: string }[]; message?: string };
    throw new Error(d.errors?.[0]?.message ?? d.message ?? "Error al subir");
  }

  const data = await res.json() as { doc?: { id: string }; id?: string };
  const id = data.doc?.id ?? data.id;
  if (!id) throw new Error("Respuesta inválida");
  return id;
}

export async function uploadMediaForProduct(file: File, alt: string): Promise<string> {
  const altText = alt.trim() || "Imagen de producto";
  return createMediaDoc(file, altText);
}
