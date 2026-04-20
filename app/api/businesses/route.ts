import { getPayload } from "payload";
import config from "@payload-config";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

// Tiempo de vida del caché — 5 minutos
const CACHE_TTL = 300;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const zone = searchParams.get("zone") ?? "";
  const delivery = searchParams.get("delivery") ?? "";

  // Clave única del caché basada en los filtros
  const cacheKey = `businesses:${category}:${zone}:${delivery}`;

  try {
    // 1. Intenta obtener del caché primero
    const cached = await redis.get(cacheKey);
    if (cached) {
      return Response.json({
        data: cached,
        source: "cache", // indica que vino del caché
      });
    }

    // 2. Si no está en caché consulta Payload
    const payload = await getPayload({ config });

    const where: Record<string, unknown> = {
      status: { equals: "active" },
    };

    if (category) where["category.slug"] = { equals: category };
    if (zone) where["zone.slug"] = { equals: zone };
    if (delivery === "true") where["hasDelivery"] = { equals: true };

    const { docs } = await payload.find({
      collection: "businesses",
      depth: 2,
      limit: 24,
      sort: "name",
    });

    // 3. Guarda en caché por 5 minutos
    await redis.set(cacheKey, docs, { ex: CACHE_TTL });

    return Response.json({
      data: docs,
      source: "database", // indica que vino de la base de datos
    });

  } catch (error) {
    console.error("[businesses API]", error);
    return Response.json(
      { error: "Error al obtener los negocios" },
      { status: 500 }
    );
  }
}