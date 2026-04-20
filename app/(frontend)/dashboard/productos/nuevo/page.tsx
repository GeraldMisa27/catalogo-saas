"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    productCategory: "",
    available: true,
    order: "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          order: Number(form.order),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.errors?.[0]?.message ?? "Error al crear el producto");
        return;
      }

      // Redirige al dashboard cuando se crea correctamente
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
        <h1 className="mb-6 text-2xl font-bold text-white">
          Añadir producto
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Nombre */}
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

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el producto..."
              rows={3}
              className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Precio */}
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

          {/* Categoría del producto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-widest">
              Categoría
            </label>
            <input
              type="text"
              value={form.productCategory}
              onChange={(e) => setForm({ ...form, productCategory: e.target.value })}
              placeholder="Platos principales, Bebidas, Postres..."
              className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Orden */}
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

          {/* Disponible */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="accent-indigo-500 w-4 h-4"
            />
            <span className="text-sm text-gray-300">Disponible para clientes</span>
          </label>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Botones */}
          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl bg-gray-800 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-40"
            >
              {loading ? "Guardando..." : "Guardar producto"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}