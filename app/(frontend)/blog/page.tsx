import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";
import Image from "next/image";

// Trae los artículos publicados desde Payload
async function getArticles() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "articles",
      where: {
        status: { equals: "published" },
      },
      depth: 1,
      limit: 12,
      sort: "-publishedAt", // más recientes primero
    });
    return docs;
  } catch {
    return [];
  }
}

export const revalidate = 60;

export const metadata = {
  title: "Blog",
  description: "Artículos sobre negocios, tendencias y guías de zonas.",
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Blog</h1>
        <p className="mb-8 text-gray-400">
          Guías, tendencias y lo mejor de los negocios cerca de ti.
        </p>

        {articles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group rounded-xl bg-gray-900 overflow-hidden hover:bg-gray-800 transition-colors"
              >
                {/* Imagen de portada */}
                <div className="relative h-44 bg-gray-800">
                  {article.coverImage &&
                    typeof article.coverImage === "object" &&
                    "url" in article.coverImage && (
                      <Image
                        src={article.coverImage.url as string}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {/* Categoría */}
                  {typeof article.category === "object" &&
                    article.category && (
                      <p className="text-xs text-indigo-400 mb-2">
                        {article.category.name}
                      </p>
                    )}

                  <h2 className="font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {article.title}
                  </h2>

                  {article.excerpt && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Fecha */}
                  {article.publishedAt && (
                    <p className="text-xs text-gray-500 mt-3">
                      {new Date(article.publishedAt).toLocaleDateString(
                        "es-CU",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No hay artículos publicados aún.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}