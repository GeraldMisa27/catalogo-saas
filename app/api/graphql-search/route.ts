import { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

const CACHE_TTL = 300; // 5 minutos

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, variables } = body;

    // Clave de caché basada en la query y variables
    const cacheKey = `graphql:${JSON.stringify({ query, variables })}`;

    // 1. Intenta obtener del caché
    const cached = await redis.get(cacheKey);
    if (cached) {
      return Response.json({ data: cached, source: "cache" });
    }

    // 2. Llama al endpoint GraphQL de Payload
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      }
    );

    const data = await res.json();

    // 3. Guarda en caché
    await redis.set(cacheKey, data, { ex: CACHE_TTL });

    return Response.json({ data, source: "database" });

  } catch (error) {
    console.error("[graphql-search]", error);
    return Response.json(
      { error: "Error en la búsqueda" },
      { status: 500 }
    );
  }
}