"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Zone {
  id: string;
  name: string;
  province: string;
}

interface RegisterForm {
  ownerName: string;
  email: string;
  password: string;
  businessName: string;
  slug: string;
  phone: string;
  whatsapp: string;
  address: string;
  categoryId: string;
  zoneId: string;
  hasDelivery: boolean;
  hasPickup: boolean;
  schedule: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [form, setForm] = useState<RegisterForm>({
    ownerName: "",
    email: "",
    password: "",
    businessName: "",
    slug: "",
    phone: "",
    whatsapp: "",
    address: "",
    categoryId: "",
    zoneId: "",
    hasDelivery: false,
    hasPickup: true,
    schedule: "",
  });

  // Carga categorías y zonas desde la API de Payload
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, zoneRes] = await Promise.all([
          fetch("/api/categories?limit=50&sort=name"),
          fetch("/api/zones?limit=50&sort=name"),
        ]);
        const catData = await catRes.json();
        const zoneData = await zoneRes.json();
        setCategories(catData.docs ?? []);
        setZones(zoneData.docs ?? []);
      } catch {
        console.error("Error cargando categorías y zonas");
      }
    }
    loadData();
  }, []);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  function handleBusinessNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm({ ...form, businessName: name, slug: generateSlug(name) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Valida categoría y zona
    if (!form.categoryId || !form.zoneId) {
      setError("Debes elegir categoría y zona");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrar el negocio");
        return;
      }

      router.push("/registro/exitoso");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-2xl font-bold text-white text-center">
          Registra tu negocio
        </h1>
        <p className="mb-8 text-center text-gray-400 text-sm">
          Gratis — tu catálogo online en minutos
        </p>

        {/* Indicador de pasos */}
        <div className="mb-8 flex items-center gap-2">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-indigo-600" : "bg-gray-700"}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-gray-700"}`} />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* ── Paso 1 — Datos del dueño ──────────────────── */}
          {step === 1 && (
            <>
              <p className="text-sm text-gray-400 font-medium">
                Paso 1 — Tu cuenta
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Tu nombre *
                </label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Gerald Misa"
                  required
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@email.com"
                  required
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!form.ownerName || !form.email || !form.password) {
                    setError("Completa todos los campos");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="rounded-xl bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
              >
                Siguiente →
              </button>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </>
          )}

          {/* ── Paso 2 — Datos del negocio ────────────────── */}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-400 font-medium">
                Paso 2 — Tu negocio
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Nombre del negocio *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={handleBusinessNameChange}
                  placeholder="Pizzería La Habana"
                  required
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {form.slug && (
                  <p className="text-xs text-gray-500">URL: /b/{form.slug}</p>
                )}
              </div>

              {/* Categoría */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Categoría *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zona */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Zona *
                </label>
                <select
                  value={form.zoneId}
                  onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                  required
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecciona una zona</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name} — {zone.province}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+53 5 123 4567"
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Calle 23 e/ L y M, Vedado"
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-widest">
                  Horario
                </label>
                <input
                  type="text"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  placeholder="Lun-Vie 9am-6pm"
                  className="rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasDelivery}
                    onChange={(e) => setForm({ ...form, hasDelivery: e.target.checked })}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">🛵 Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasPickup}
                    onChange={(e) => setForm({ ...form, hasPickup: e.target.checked })}
                    className="accent-indigo-500 w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">🏪 Recogida</span>
                </label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-xl bg-gray-800 py-3 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-40"
                >
                  {loading ? "Registrando..." : "Crear mi catálogo"}
                </button>
              </div>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Acceder
          </Link>
        </p>
      </div>
    </main>
  );
}