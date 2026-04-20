import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

const CACHE_TTL = 300;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "";
    const zone = searchParams.get("zone") ?? "";
    const delivery = searchParams.get("delivery") ?? "";
    const q = searchParams.get("q") ?? "";

    // Con búsqueda por texto no usamos caché — resultados muy variados
    const useCache = !q;
    const cacheKey = `search:v2:${category}:${zone}:${delivery}`;

    try {
        if (useCache) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return Response.json({ data: cached, source: "cache" });
            }
        }

        const payload = await getPayload({ config });

        // Filtros base para negocios
        const where: Where = {
            status: { equals: "active" },
        };

        if (category) where["category.slug"] = { equals: category };
        if (zone) where["zone.slug"] = { equals: zone };
        if (delivery === "true") where["hasDelivery"] = { equals: true };
        if (delivery === "false") where["hasPickup"] = { equals: true };
        if (q) where["name"] = { like: q };

        const businessMatchesFilters = (business: unknown) => {
            if (!business || typeof business !== "object") return false;

            const b = business as {
                status?: string;
                category?: { slug?: string } | string | null;
                zone?: { slug?: string } | string | null;
                hasDelivery?: boolean | null;
                hasPickup?: boolean | null;
            };

            if (b.status !== "active") return false;

            if (category) {
                const categorySlug =
                    typeof b.category === "object" && b.category
                        ? b.category.slug
                        : undefined;
                if (categorySlug !== category) return false;
            }

            if (zone) {
                const zoneSlug =
                    typeof b.zone === "object" && b.zone ? b.zone.slug : undefined;
                if (zoneSlug !== zone) return false;
            }

            if (delivery === "true" && !b.hasDelivery) return false;
            if (delivery === "false" && !b.hasPickup) return false;

            return true;
        };

        // Busca negocios en paralelo con productos
        const [businessesResult, productsResult] = await Promise.all([
            payload.find({
                collection: "businesses",
                where,
                depth: 2,
                limit: 24,
                sort: "name",
            }),
            // Si hay texto busca también en productos
            q
                ? payload.find({
                    collection: "products",
                    where: {
                        name: { like: q },
                        available: { equals: true },
                    },
                    depth: 2, // trae el negocio relacionado
                    limit: 20,
                })
                : Promise.resolve({ docs: [] }),
        ]);

        // IDs de negocios ya encontrados directamente
        const businessIds = new Set(businessesResult.docs.map((b) => b.id));

        // Negocios encontrados a través de sus productos
        const filteredProductDocs = productsResult.docs.filter((product) => {
            const business = product.business;
            if (!business || typeof business !== "object") return false;
            return businessMatchesFilters(business);
        });
        const normalizedQuery = q.trim().toLowerCase();
        const scoreProductByName = (name: string) => {
            const normalizedName = name.trim().toLowerCase();
            if (!normalizedQuery) return 0;
            if (normalizedName === normalizedQuery) return 0;
            if (normalizedName.startsWith(normalizedQuery)) return 1;
            if (normalizedName.includes(normalizedQuery)) return 2;
            return 3;
        };

        const businessesFromProducts = filteredProductDocs
            .filter((product) => {
                const business = product.business;
                if (!business || typeof business !== "object") return false;
                // Evita duplicados — no añade si ya está en los resultados
                if (businessIds.has((business as { id: string }).id)) return false;
                return true;
            })
            .map((product) => product.business);

        const businesses = [
            ...businessesResult.docs,
            ...businessesFromProducts,
        ];

        const products = filteredProductDocs
            .sort((a, b) => {
                const scoreA = scoreProductByName(a.name);
                const scoreB = scoreProductByName(b.name);
                if (scoreA !== scoreB) return scoreA - scoreB;
                return a.name.localeCompare(b.name);
            })
            .map((product) => {
                const business = product.business;
                if (!business || typeof business !== "object") return null;

                const b = business as { id: string; name?: string; slug?: string };
                if (!b.id || !b.name || !b.slug) return null;

                return {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image:
                        product.image && typeof product.image === "object"
                            ? { url: product.image.url ?? null }
                            : null,
                    business: {
                        id: b.id,
                        name: b.name,
                        slug: b.slug,
                    },
                };
            })
            .filter(Boolean);

        const responseData = {
            businesses,
            products,
        };

        if (useCache) {
            await redis.set(cacheKey, responseData, { ex: CACHE_TTL });
        }

        return Response.json({
            data: responseData,
            source: "database",
            // Metadata útil para debug
            meta: {
                fromBusinesses: businesses.length,
                fromProducts: businessesFromProducts.length,
                totalBusinesses: businesses.length,
                totalProducts: products.length,
            },
        });

    } catch (error) {
        console.error("[businesses API]", error);
        return Response.json(
            { error: "Error al obtener los negocios" },
            { status: 500 }
        );
    }
}