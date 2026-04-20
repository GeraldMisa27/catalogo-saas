import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getZone(slug: string) {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "zones",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    return docs[0] ?? null;
  } catch {
    return null;
  }
}

async function getBusinessesByZone(slug: string) {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "businesses",
      where: {
        "zone.slug": { equals: slug },
        status: { equals: "active" },
      },
      depth: 2,
      limit: 24,
      sort: "name",
    });
    return docs;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const zone = await getZone(slug);
  if (!zone) return { title: "Zona no encontrada" };
  return {
    title: `Negocios en ${zone.name}`,
    description: `Encuentra los mejores negocios en ${zone.name}, ${zone.province}.`,
  };
}

export const revalidate = 60;

export default async function ZonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [zone, businesses] = await Promise.all([
    getZone(slug),
    getBusinessesByZone(slug),
  ]);

  if (!zone) notFound();

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            📍 {zone.name}
          </h1>
          <p className="text-gray-400 mt-1">{zone.province}</p>
          {zone.description && (
            <p className="text-gray-400 mt-2">{zone.description}</p>
          )}
          <p className="text-sm text-indigo-400 mt-2">
            {businesses.length} negocio{businesses.length !== 1 ? "s" : ""} disponible{businesses.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Negocios */}
        {businesses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/b/${business.slug}`}
                className="group rounded-xl bg-gray-900 overflow-hidden hover:bg-gray-800 transition-colors"
              >
                <div className="relative h-36 bg-gray-800">
                  {business.coverImage &&
                    typeof business.coverImage === "object" &&
                    "url" in business.coverImage && (
                      <Image
                        src={business.coverImage.url as string}
                        alt={business.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {business.name}
                  </h3>
                  {typeof business.category === "object" && (
                    <p className="text-xs text-indigo-400 mt-1">
                      {business.category.name}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    {business.hasDelivery && (
                      <span className="text-xs text-gray-400">🛵 Delivery</span>
                    )}
                    {business.hasPickup && (
                      <span className="text-xs text-gray-400">🏪 Recogida</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No hay negocios en esta zona aún.
            </p>
            <Link
              href="/buscar"
              className="mt-4 inline-block text-indigo-400 hover:text-indigo-300"
            >
              Ver todos los negocios
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}