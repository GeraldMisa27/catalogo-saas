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
    const cacheKey = `businesses:${category}:${zone}:${delivery}`;

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
        const businessesFromProducts = productsResult.docs
            .filter((product) => {
                const business = product.business;
                if (!business || typeof business !== "object") return false;
                // Evita duplicados — no añade si ya está en los resultados
                if (businessIds.has((business as { id: string }).id)) return false;
                // Solo negocios activos
                return (business as { status: string }).status === "active";
            })
            .map((product) => product.business);

        // Combina los dos resultados
        const combined = [
            ...businessesResult.docs,
            ...businessesFromProducts,
        ];

        if (useCache) {
            await redis.set(cacheKey, combined, { ex: CACHE_TTL });
        }

        return Response.json({
            data: combined,
            source: "database",
            // Metadata útil para debug
            meta: {
                fromBusinesses: businessesResult.docs.length,
                fromProducts: businessesFromProducts.length,
                total: combined.length,
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