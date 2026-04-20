import { getPayload } from "payload";
import config from "@payload-config";
import Image from "next/image";
import { notFound } from "next/navigation";

// Trae el artículo por su slug
async function getArticle(slug: string) {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "articles",
      where: {
        slug: { equals: slug },
        status: { equals: "published" },
      },
      depth: 1,
      limit: 1,
    });
    return docs[0] ?? null;
  } catch {
    return null;
  }
}

// Metadatos SEO por artículo
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artículo no encontrado" };
  return {
    title: article.title,
    description: article.excerpt ?? "",
  };
}

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* ── Categoría ────────────────────────────────── */}
        {typeof article.category === "object" && article.category && (
          <p className="text-sm text-indigo-400 mb-3">
            {article.category.name}
          </p>
        )}

        {/* ── Título ───────────────────────────────────── */}
        <h1 className="text-3xl font-bold text-white leading-tight">
          {article.title}
        </h1>

        {/* ── Fecha ────────────────────────────────────── */}
        {article.publishedAt && (
          <p className="text-sm text-gray-500 mt-2">
            {new Date(article.publishedAt).toLocaleDateString("es-CU", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}

        {/* ── Imagen de portada ─────────────────────────── */}
        {article.coverImage &&
          typeof article.coverImage === "object" &&
          "url" in article.coverImage && (
            <div className="relative mt-6 h-64 w-full overflow-hidden rounded-xl md:h-80">
              <Image
                src={article.coverImage.url as string}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

        {/* ── Resumen ───────────────────────────────────── */}
        {article.excerpt && (
          <p className="mt-6 text-lg text-gray-300 leading-relaxed border-l-4 border-indigo-500 pl-4">
            {article.excerpt}
          </p>
        )}

        {/* ── Contenido rich text ───────────────────────── */}
        {/* Por ahora mostramos un placeholder */}
        {/* En la siguiente fase añadimos el renderer de Lexical */}
        <div className="mt-8 prose prose-invert prose-indigo max-w-none">
          <p className="text-gray-400">
            Contenido del artículo disponible próximamente.
          </p>
        </div>
      </div>
    </main>
  );
}