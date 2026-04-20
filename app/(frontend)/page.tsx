import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";
import Image from "next/image";
import { BusinessFromAPI } from "@/types";

// Categorías desde Payload con ISR
async function getCategories() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "categories",
      limit: 12,
      sort: "name",
    });
    return docs;
  } catch {
    return [];
  }
}

// Negocios destacados desde la API cacheada
async function getFeaturedBusinesses() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/businesses`,
      { next: { revalidate: 60 } }
    );
    const { data } = await res.json();
    return (data ?? []).slice(0, 6); // máximo 6 en la home
  } catch {
    return [];
  }
}

export const revalidate = 60;

export default async function HomePage() {
  const [categories, businesses] = await Promise.all([
    getCategories(),
    getFeaturedBusinesses(),
  ]);

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-linear-to-b from-gray-900 to-gray-950 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-white md:text-6xl">
          Encuentra negocios
          <span className="text-indigo-400"> cerca de ti</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
          Restaurantes, peluquerías, bodegas y más — con precios,
          fotos y contacto directo.
        </p>

        <div className="mx-auto mt-8 flex max-w-lg gap-2">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="flex-1 rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Link
            href="/buscar"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Buscar
          </Link>
        </div>
      </section>

      {/* ── Categorías ───────────────────────────────────── */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Explorar por categoría
          </h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className="flex flex-col items-center gap-2 rounded-xl bg-gray-800 p-4 text-center hover:bg-gray-700 transition-colors"
                >
                  {cat.icon && (
                    <span className="text-3xl">{cat.icon}</span>
                  )}
                  <span className="text-sm text-gray-300">{cat.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay categorías disponibles.</p>
          )}
        </div>
      </section>

      {/* ── Negocios destacados ──────────────────────────── */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Negocios destacados
            </h2>
            <Link
              href="/buscar"
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Ver todos →
            </Link>
          </div>

          {businesses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {businesses.map((business: BusinessFromAPI) => (
                <Link
                  key={business.id}
                  href={`/b/${business.slug}`}
                  className="group rounded-xl bg-gray-900 overflow-hidden hover:bg-gray-800 transition-colors"
                >
                  <div className="relative h-36 bg-gray-800">
                    {business.coverImage?.url && (
                      <Image
                        src={business.coverImage.url}
                        alt={business.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {business.name}
                    </h3>
                    {business.category?.name && (
                      <p className="text-xs text-indigo-400 mt-1">
                        {business.category.name}
                        {business.zone?.name && ` · ${business.zone.name}`}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-gray-800 h-48"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}