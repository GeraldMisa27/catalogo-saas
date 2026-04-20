"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
}: {
  productId: string;
  initial: InitialForm;
}) {
  const router = useRouter();
  const [form, setForm] = useState<InitialForm>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          order: Number(form.order),
        }),
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
