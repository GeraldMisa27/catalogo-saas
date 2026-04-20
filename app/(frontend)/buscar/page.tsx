import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import { BusinessFromAPI } from "@/types";

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

async function getBusinesses({
    category,
    zone,
    delivery,
    q,
}: {
    category?: string;
    zone?: string;
    delivery?: string;
    q?: string;
}) {
    try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (zone) params.set("zone", zone);
        if (delivery) params.set("delivery", delivery);
        if (q) params.set("q", q);

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL}/api/businesses?${params.toString()}`,
            { cache: "no-store" }
        );
        const { data } = await res.json();
        return data ?? [];
    } catch {
        return [];
    }
}

export const dynamic = "force-dynamic";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{
        categoria?: string;
        zona?: string;
        delivery?: string;
        q?: string;
    }>;
}) {
    const params = await searchParams;
    const { categoria, zona, delivery, q } = params;

    const [categories, zones, businesses] = await Promise.all([
        getCategories(),
        getZones(),
        getBusinesses({ category: categoria, zone: zona, delivery, q }),
    ]);

    return (
        <main className="min-h-screen px-4 py-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-6 text-2xl font-bold text-white">
                    Explorar negocios
                </h1>

                {/* ── Filtros ────────────────────────────────────── */}
                <form className="mb-8 flex flex-wrap gap-3">

                    {/* Búsqueda por texto */}
                    <input
                        type="text"
                        name="q"
                        defaultValue={q ?? ""}
                        placeholder="Buscar negocio o producto..."
                        className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                    />

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
                    <select
                        name="delivery"
                        defaultValue={delivery ?? ""}
                        className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Delivery o recogida</option>
                        <option value="true">🛵 Solo con delivery</option>
                        <option value="false">🏪 Solo con recogida</option>
                    </select>

                    {/* Botón filtrar */}
                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                    >
                        Filtrar
                    </button>

                    {/* Limpiar filtros */}
                    {(categoria || zona || delivery || q) && (
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
                            {businesses.map((business: BusinessFromAPI) => (
                                <Link
                                    key={business.id}
                                    href={`/b/${business.slug}`}
                                    className="group rounded-xl bg-gray-900 overflow-hidden hover:bg-gray-800 transition-colors"
                                >
                                    {/* Imagen de portada */}
                                    <div className="relative h-36 bg-gray-800">
                                        {business.coverImage?.url && (
                                            <Image
                                                src={business.coverImage.url}
                                                alt={business.name}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        )}
                                    </div>

                                    {/* Info */}
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