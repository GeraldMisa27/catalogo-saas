"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadMediaForProduct } from "@/lib/uploadMediaClient";

type InitialForm = {
  name: string;
  description: string;
  price: string;
  productCategory: string;
  available: boolean;
  order: string;
};

export default function EditProductForm({
  productId,
  initial,
  initialImageUrl,
}: {
  productId: string;
  initial: InitialForm;
  initialImageUrl: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState<InitialForm>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayUrl = imagePreview ?? (!removeImage ? initialImageUrl : null);

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setRemoveImage(false);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let image: string | null | undefined;

      if (imageFile) {
        const alt = form.name.trim() || "Producto";
        image = await uploadMediaForProduct(imageFile, alt);
      } else if (removeImage) {
        image = null;
      }

      const payload: Record<string, unknown> = {
        ...form,
        price: Number(form.price),
        order: Number(form.order),
      };
      if (image !== undefined) {
        payload.image = image;
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { errors?: { message?: string }[] }).errors?.[0]?.message ??
            "Error al actualizar el producto"
        );
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-white">Editar producto</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Foto del producto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="text-sm text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
            />
            {initialImageUrl && !imageFile && (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => {
                    setRemoveImage(e.target.checked);
                    if (e.target.checked) {
                      setImageFile(null);
                      setImagePreview(null);
                    }
                  }}
                  className="accent-indigo-500"
                />
                Quitar imagen actual
              </label>
            )}
            {displayUrl && (
              <div className="relative mt-2 aspect-video w-full max-h-48 overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayUrl}
                  alt=""
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Pizza Margarita"
              required
              className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe el producto..."
              rows={3}
              className="resize-none rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Precio (CUP) *
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="150"
              required
              min="0"
              className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Categoría
            </label>
            <input
              type="text"
              value={form.productCategory}
              onChange={(e) =>
                setForm({ ...form, productCategory: e.target.value })
              }
              placeholder="Platos principales, Bebidas, Postres..."
              className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Orden de aparición
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
              min="0"
              className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
              className="h-4 w-4 accent-indigo-500"
            />
            <span className="text-sm text-gray-300">
              Disponible para clientes
            </span>
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl bg-gray-800 py-3 text-sm text-gray-300 transition-colors hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
