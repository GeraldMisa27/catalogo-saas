import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";

// Trae categorías para el filtro
async function getCategories() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "categories",
      limit: 50,
      sort: "name",
    });
    return docs;
  } catch {
    return [];
  }
}

// Trae zonas para el filtro
async function getZones() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "zones",
      limit: 50,
      sort: "name",
    });
    return docs;
  } catch {
    return [];
  }
}

// Trae negocios con filtros opcionales
async function getBusinesses({
  category,
  zone,
  delivery,
}: {
  category?: string;
  zone?: string;
  delivery?: string;
}) {
  try {
    const payload = await getPayload({ config });

    // Construye los filtros dinámicamente
    const where: Record<string, unknown> = {
      status: { equals: "active" },
    };

    if (category) {
      where["category.slug"] = { equals: category };
    }

    if (zone) {
      where["zone.slug"] = { equals: zone };
    }

    if (delivery === "true") {
      where["hasDelivery"] = { equals: true };
    }

    const { docs } = await payload.find({
      collection: "businesses",
      depth: 2,
      limit: 24,
      sort: "name",
    });

    return docs;
  } catch {
    return [];
  }
}

// Esta página es SSR porque los filtros cambian por petición
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    zona?: string;
    delivery?: string;
  }>;
}) {
  const params = await searchParams;
  const { categoria, zona, delivery } = params;

  // Carga en paralelo para mejor rendimiento
  const [categories, zones, businesses] = await Promise.all([
    getCategories(),
    getZones(),
    getBusinesses({
      category: categoria,
      zone: zona,
      delivery,
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold text-white">
          Explorar negocios
        </h1>

        {/* ── Filtros ────────────────────────────────────── */}
        <form className="mb-8 flex flex-wrap gap-3">

          {/* Filtro por categoría */}
          <select
            name="categoria"
            defaultValue={categoria ?? ""}
            className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug ?? ""}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Filtro por zona */}
          <select
            name="zona"
            defaultValue={zona ?? ""}
            className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las zonas</option>
            {zones.map((z) => (
              <option key={z.id} value={z.slug ?? ""}>
                {z.name}
              </option>
            ))}
          </select>

          {/* Filtro delivery */}
          <label className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm text-white cursor-pointer">
            <input
              type="checkbox"
              name="delivery"
              value="true"
              defaultChecked={delivery === "true"}
              className="accent-indigo-500"
            />
            🛵 Solo con delivery
          </label>

          {/* Botón aplicar filtros */}
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Filtrar
          </button>

          {/* Limpiar filtros */}
          {(categoria || zona || delivery) && (
            <a
              href="/buscar"
              className="rounded-xl bg-gray-700 px-6 py-2 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </a>
          )}
        </form>

        {/* ── Resultados ─────────────────────────────────── */}
        {businesses.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-gray-400">
              {businesses.length} negocio{businesses.length !== 1 ? "s" : ""} encontrado{businesses.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <Link
                  key={business.id}
                  href={`/b/${business.slug}`}
                  className="group rounded-xl bg-gray-900 overflow-hidden hover:bg-gray-800 transition-colors"
                >
                  {/* Imagen de portada */}
                  <div className="relative h-36 bg-gray-800">
                    {business.coverImage &&
                      typeof business.coverImage === "object" &&
                      "url" in business.coverImage && (
                        <Image
                          src={business.coverImage.url as string}
                          alt={business.name}
                          fill
                          className="object-cover"
                        />
                      )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {business.name}
                    </h3>
                    {typeof business.category === "object" && (
                      <p className="text-xs text-indigo-400 mt-1">
                        {business.category.name}
                        {typeof business.zone === "object" &&
                          ` · ${business.zone.name}`}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      {business.hasDelivery && (
                        <span className="text-xs text-gray-400">
                          🛵 Delivery
                        </span>
                      )}
                      {business.hasPickup && (
                        <span className="text-xs text-gray-400">
                          🏪 Recogida
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No se encontraron negocios con esos filtros.
            </p>
            <a
              href="/buscar"
              className="mt-4 inline-block text-indigo-400 hover:text-indigo-300"
            >
              Ver todos los negocios
            </a>
          </div>
        )}
      </div>
    </main>
  );
}