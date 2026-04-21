import { getPayload } from "payload";
import type { Where } from "payload";
import config from "@payload-config";
import { getMediaDisplayUrl } from "@/lib/mediaUrl";
import { redis } from "@/lib/redis";
import { normalizeForSearch, relatednessScore } from "@/lib/searchRelated";
import { NextRequest } from "next/server";

const CACHE_TTL = 300;

function siteOriginFromRequest(req: NextRequest): string {
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host =
        req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
    if (host) return `${proto}://${host}`;
    return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
}

function jsonImage(media: unknown, siteOrigin: string): { url: string } | null {
    const url = getMediaDisplayUrl(media, siteOrigin);
    return url ? { url } : null;
}

function jsonCover(cover: unknown, siteOrigin: string): { url: string } | null {
    return jsonImage(cover, siteOrigin);
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "";
    const zone = searchParams.get("zone") ?? "";
    const delivery = searchParams.get("delivery") ?? "";
    const q = searchParams.get("q") ?? "";

    // Con búsqueda por texto no usamos caché — resultados muy variados
    const useCache = !q;
    const cacheKey = `search:v4:${category}:${zone}:${delivery}`;

    try {
        if (useCache) {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return Response.json({ data: cached, source: "cache" });
            }
        }

        const payload = await getPayload({ config });
        const siteOrigin = siteOriginFromRequest(req);

        // Filtros base para negocios
        const where: Where = {
            status: { equals: "active" },
        };

        if (category) where["category.slug"] = { equals: category };
        if (zone) where["zone.slug"] = { equals: zone };
        if (delivery === "true") where["hasDelivery"] = { equals: true };
        if (delivery === "false") where["hasPickup"] = { equals: true };
        const normalizedQuery = normalizeForSearch(q);
        const matchesQuery = (value: string) => {
            if (!normalizedQuery) return true;
            return normalizeForSearch(value).includes(normalizedQuery);
        };

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
                        available: { equals: true },
                    },
                    depth: 2, // trae el negocio relacionado
                    limit: 100,
                })
                : Promise.resolve({ docs: [] }),
        ]);
        const businessesByName = businessesResult.docs.filter((business) =>
            matchesQuery(business.name)
        );

        // IDs de negocios ya encontrados directamente
        const businessIds = new Set(businessesByName.map((b) => b.id));

        // Negocios encontrados a través de sus productos
        const filteredProductDocs = productsResult.docs.filter((product) => {
            const business = product.business;
            if (!business || typeof business !== "object") return false;
            if (!matchesQuery(product.name)) return false;
            return businessMatchesFilters(business);
        });
        const scoreProductByName = (name: string) => {
            const normalizedName = normalizeForSearch(name);
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

        type BusinessDoc = (typeof businessesResult.docs)[number];
        const businessesFromProductDocs = businessesFromProducts.filter(
            (b): b is BusinessDoc => typeof b === "object" && b !== null
        );
        const businesses = [
            ...businessesByName,
            ...businessesFromProductDocs,
        ].map((b) => ({
            ...b,
            coverImage: jsonCover(b.coverImage, siteOrigin),
        })) as typeof businessesResult.docs;

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
                    image: jsonImage(product.image, siteOrigin),
                    business: {
                        id: b.id,
                        name: b.name,
                        slug: b.slug,
                    },
                };
            })
            .filter(Boolean);

        const MIN_RELATED_SCORE = 0.22;
        const MAX_RELATED = 8;

        let relatedBusinesses: typeof businessesResult.docs = [];
        let relatedProducts: NonNullable<(typeof products)[number]>[] = [];

        if (
            normalizedQuery.length >= 2 &&
            businesses.length === 0 &&
            products.length === 0
        ) {
            relatedBusinesses = businessesResult.docs
                .map((b) => ({
                    doc: b,
                    score: relatednessScore(q, b.name),
                }))
                .filter((x) => x.score >= MIN_RELATED_SCORE)
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_RELATED)
                .map((x) => ({
                    ...x.doc,
                    coverImage: jsonCover(x.doc.coverImage, siteOrigin),
                })) as typeof businessesResult.docs;

            const productCandidates = productsResult.docs.filter((product) => {
                const business = product.business;
                if (!business || typeof business !== "object") return false;
                return businessMatchesFilters(business);
            });

            relatedProducts = productCandidates
                .map((product) => {
                    const desc =
                        typeof product.description === "string"
                            ? product.description
                            : "";
                    const score = Math.max(
                        relatednessScore(q, product.name),
                        desc ? relatednessScore(q, desc) : 0
                    );
                    return { product, score };
                })
                .filter((x) => x.score >= MIN_RELATED_SCORE)
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_RELATED)
                .map((x) => {
                    const product = x.product;
                    const business = product.business;
                    if (!business || typeof business !== "object") return null;
                    const b = business as {
                        id: string;
                        name?: string;
                        slug?: string;
                    };
                    if (!b.id || !b.name || !b.slug) return null;
                    return {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: jsonImage(product.image, siteOrigin),
                        business: {
                            id: b.id,
                            name: b.name,
                            slug: b.slug,
                        },
                    };
                })
                .filter(Boolean) as NonNullable<(typeof products)[number]>[];
        }

        const responseData = {
            businesses,
            products,
            ...(relatedBusinesses.length > 0 && {
                relatedBusinesses,
            }),
            ...(relatedProducts.length > 0 && { relatedProducts }),
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