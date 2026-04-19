import Link from "next/link";

// Categorías destacadas para la home
// Luego las traeremos desde Payload
const FEATURED_CATEGORIES = [
  { name: "Restaurantes", slug: "restaurantes", icon: "🍽️" },
  { name: "Cafeterías", slug: "cafeterias", icon: "☕" },
  { name: "Peluquerías", slug: "peluquerias", icon: "💇" },
  { name: "Bodegones", slug: "bodegones", icon: "🛒" },
  { name: "Hoteles", slug: "hoteles", icon: "🏨" },
  { name: "Dulcerías", slug: "dulcerias", icon: "🍰" },
];

export default function HomePage() {
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

      {/* ── Categorías ───────────────────────────────────── */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Explorar por categoría
          </h2>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl bg-gray-800 p-4 text-center hover:bg-gray-700 transition-colors"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-sm text-gray-300">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Negocios destacados ──────────────────────────── */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Negocios destacados
          </h2>
          {/* Placeholder — luego conectamos con Payload */}
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