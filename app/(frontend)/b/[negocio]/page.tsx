import { getPayload } from "payload";
import config from "@payload-config";
import { notFound } from "next/navigation";
import Image from "next/image";
import BusinessMap from "@/components/BusinessMap";

// Trae el negocio por su slug
async function getBusiness(slug: string) {
    try {
        const payload = await getPayload({ config });
        const { docs } = await payload.find({
            collection: "businesses",
            where: {
                slug: { equals: slug },
                status: { equals: "active" },
            },
            depth: 2, // trae las relaciones — category, zone, owner
            limit: 1,
        });
        return docs[0] ?? null;
    } catch {
        return null;
    }
}

// Trae los productos del negocio
async function getProducts(businessId: string) {
    try {
        const payload = await getPayload({ config });
        const { docs } = await payload.find({
            collection: "products",
            where: {
                business: { equals: businessId },
                available: { equals: true },
            },
            sort: "order",
            limit: 50,
        });
        return docs;
    } catch {
        return [];
    }
}

// Genera los metadatos SEO dinámicos por negocio
export async function generateMetadata({
    params,
}: {
    params: Promise<{ negocio: string }>;
}) {
    const { negocio } = await params;
    const business = await getBusiness(negocio);

    if (!business) return { title: "Negocio no encontrado" };

    return {
        title: business.name,
        description: `${business.name} — Ver productos, precios y contacto.`,
    };
}

export default async function BusinessPage({
    params,
}: {
    params: Promise<{ negocio: string }>;
}) {
    const { negocio } = await params;
    const business = await getBusiness(negocio);

    // Si no existe el negocio muestra 404
    if (!business) notFound();

    const products = await getProducts(business.id);

    // Agrupa productos por categoría
    const productsByCategory = products.reduce(
        (acc, product) => {
            const cat = product.productCategory ?? "General";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(product);
            return acc;
        },
        {} as Record<string, typeof products>
    );

    return (
        <main className="min-h-screen bg-gray-950">
            {/* JSON-LD Schema.org — para SEO rico en Google */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        name: business.name,
                        address: business.address ?? "",
                        telephone: business.phone ?? "",
                        url: `${process.env.NEXT_PUBLIC_SITE_URL}/b/${business.slug}`,
                    }),
                }}
            />
            {/* ── Portada ──────────────────────────────────────── */}
            <div className="relative h-48 w-full bg-gray-800 md:h-64">
                {business.coverImage &&
                    typeof business.coverImage === "object" &&
                    "url" in business.coverImage && (
                        <Image
                            src={business.coverImage.url as string}
                            alt={business.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
            </div>

            <div className="mx-auto max-w-3xl px-4 pb-16">

                {/* ── Info principal ───────────────────────────────── */}
                <div className="relative -mt-12 mb-6 flex items-end gap-4">
                    {/* Logo */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border-4 border-gray-950 bg-gray-800">
                        {business.logo &&
                            typeof business.logo === "object" &&
                            "url" in business.logo && (
                                <Image
                                    src={business.logo.url as string}
                                    alt={business.name}
                                    fill
                                    className="object-cover"
                                    priority  // precarga como recurso crítico — mejora LCP
                                    sizes="100vw"
                                />
                            )}
                    </div>
                    <div className="pb-2">
                        <h1 className="text-2xl font-bold text-white">
                            {business.name}
                        </h1>
                        {/* Categoría y zona */}
                        {typeof business.category === "object" && (
                            <p className="text-sm text-indigo-400">
                                {business.category.name}
                                {typeof business.zone === "object" &&
                                    ` · ${business.zone.name}`}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Servicios ────────────────────────────────────── */}
                <div className="mb-6 flex gap-2">
                    {business.hasDelivery && (
                        <span className="rounded-full bg-indigo-900 px-3 py-1 text-xs text-indigo-300">
                            🛵 Delivery
                        </span>
                    )}
                    {business.hasPickup && (
                        <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
                            🏪 Recogida
                        </span>
                    )}
                </div>

                {/* ── Contacto ─────────────────────────────────────── */}
                <div className="mb-8 grid gap-2 rounded-xl bg-gray-900 p-4 md:grid-cols-2">
                    {business.phone && (
                        <a
                            href={`tel:${business.phone}`}
                            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                        >
                            📞 {business.phone}
                        </a>
                    )}
                    {business.whatsapp && (
                        <a
                            href={`https://wa.me/53${business.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300"
                        >
                            💬 WhatsApp
                        </a>
                    )}
                    {business.instagram && (
                        <a
                            href={`https://instagram.com/${business.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300"
                        >
                            📸 @{business.instagram}
                        </a>
                    )}
                    {business.telegram && (
                        <a
                            href={`https://t.me/${business.telegram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                            ✈️ Telegram
                        </a>
                    )}
                    {business.address && (
                        <p className="flex items-center gap-2 text-sm text-gray-400">
                            📍 {business.address}
                        </p>
                    )}
                    {business.schedule && (
                        <p className="flex items-center gap-2 text-sm text-gray-400">
                            🕐 {business.schedule}
                        </p>
                    )}
                </div>
                {/* ── Mapa ─────────────────────────────────────────── */}
                {business.latitude && business.longitude && (
                    <div className="mb-8">
                        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-3">
                            Ubicación
                        </h2>
                        <BusinessMap
                            latitude={business.latitude}
                            longitude={business.longitude}
                            name={business.name}
                        />
                        {business.address && (
                            <p className="text-sm text-gray-400 mt-2">
                                📍 {business.address}
                            </p>
                        )}
                    </div>
                )}
                {/* ── Productos ────────────────────────────────────── */}
                {products.length > 0 ? (
                    <div>
                        <h2 className="mb-4 text-lg font-semibold text-white">
                            Catálogo
                        </h2>
                        {Object.entries(productsByCategory).map(([category, items]) => (
                            <div key={category} className="mb-8">
                                {/* Título de la categoría */}
                                <h3 className="mb-3 text-sm font-medium uppercase tracking-widest text-indigo-400">
                                    {category}
                                </h3>
                                <div className="grid gap-3">
                                    {items.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-4 rounded-xl bg-gray-900 p-3"
                                        >
                                            {/* Imagen del producto */}
                                            {product.image &&
                                                typeof product.image === "object" &&
                                                "url" in product.image && (
                                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                                                        <Image
                                                            src={product.image.url as string}
                                                            alt={product.name}
                                                            width={64}
                                                            height={64}
                                                            className="h-full w-full object-cover"
                                                            sizes="64px"
                                                        />
                                                    </div>
                                                )}
                                            <div className="flex-1">
                                                <p className="font-medium text-white">
                                                    {product.name}
                                                </p>
                                                {product.description && (
                                                    <p className="text-sm text-gray-400">
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Precio */}
                                            <p className="shrink-0 font-semibold text-indigo-400">
                                                ${product.price} CUP
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">
                        Este negocio aún no tiene productos en su catálogo.
                    </p>
                )}
            </div>
        </main>
    );
}