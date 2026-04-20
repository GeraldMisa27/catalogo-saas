/**
 * Subida compatible con @payloadcms/storage-uploadthing en Vercel:
 * 1) Sube el archivo con el cliente de UploadThing al endpoint de Payload.
 * 2) Crea el documento en `media` con multipart (_payload + file como JSON), como el admin.
 *
 * Solo usar en componentes cliente (`"use client"`).
 */
import { genUploader } from "uploadthing/client";

/**
 * Ruta registrada por `initClientUploads` en @payloadcms/storage-uploadthing.
 * Debe alinearse con `routes.api` (por defecto `/api`).
 */
const STORAGE_CLIENT_UPLOAD_URL =
  "/api/storage-uploadthing-client-upload-route?collectionSlug=media";

function parsePayloadError(data: unknown): string {
  if (!data || typeof data !== "object") return "Error al subir la imagen";
  const d = data as {
    errors?: { message?: string }[];
    message?: string;
  };
  return d.errors?.[0]?.message ?? d.message ?? "Error al subir la imagen";
}

export async function uploadMediaForProduct(
  file: File,
  alt: string
): Promise<string> {
  const altText = alt.trim() || "Imagen de producto";

  const { uploadFiles } = genUploader({
    package: "storage-uploadthing",
    url: STORAGE_CLIENT_UPLOAD_URL,
  });

  const ut = await uploadFiles("uploader", { files: [file] });
  const key = ut[0]?.key;
  if (!key) {
    throw new Error("UploadThing no devolvió una clave de archivo. Revisa UPLOADTHING_TOKEN.");
  }

  const fileMeta = JSON.stringify({
    clientUploadContext: { key },
    collectionSlug: "media",
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
  });

  const formData = new FormData();
  formData.append("_payload", JSON.stringify({ alt: altText }));
  formData.append("file", fileMeta);

  const res = await fetch("/api/media", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(parsePayloadError(data));
  }

  const data = (await res.json()) as { doc?: { id: string }; id?: string };
  const id = data.doc?.id ?? data.id;
  if (!id) throw new Error("Respuesta inválida al crear el medio");
  return id;
}
