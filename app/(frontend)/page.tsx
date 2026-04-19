import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

// Trae las categorías desde Payload con ISR de 60 segundos
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
    // Fallback si Payload falla
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();

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

        {/* Buscador */}
        <div className="mx-auto mt-8 flex max-w-lg gap-2">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            className="flex-1 rounded-xl bg-gray-800 px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition-colors">
            Buscar
          </button>
        </div>
      </section>

      {/* ── Categorías desde Payload ─────────────────────── */}
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
                  {/* Icono emoji si existe */}
                  {cat.icon && (
                    <span className="text-3xl">{cat.icon}</span>
                  )}
                  <span className="text-sm text-gray-300">{cat.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            // Si no hay categorías aún
            <p className="text-gray-500">
              No hay categorías disponibles aún.
            </p>
          )}
        </div>
      </section>

      {/* ── Negocios destacados ──────────────────────────── */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Negocios destacados
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-gray-800 h-48"
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}