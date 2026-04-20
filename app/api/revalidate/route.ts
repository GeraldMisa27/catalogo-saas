import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

// Clave secreta para proteger el webhook
// Solo Payload puede llamar a este endpoint
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET ?? "secret";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secret, collection, slug } = body;

    // Verifica la clave secreta
    if (secret !== REVALIDATE_SECRET) {
      return Response.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Limpia el caché de Redis para businesses
    if (collection === "businesses") {
      // Obtiene todas las claves de businesses en Redis
      const keys = await redis.keys("businesses:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }

      // Invalida el caché de Next.js ISR
      revalidatePath("/");
      revalidatePath("/buscar");

      if (slug) {
        revalidatePath(`/b/${slug}`);
      }

      return Response.json({
        revalidated: true,
        keys: keys.length,
        message: `Caché limpiado — ${keys.length} claves eliminadas`,
      });
    }

    // Para artículos del blog
    if (collection === "articles") {
      revalidatePath("/blog");
      if (slug) revalidatePath(`/blog/${slug}`);
      return Response.json({ revalidated: true });
    }

    // Para categorías
    if (collection === "categories") {
      revalidatePath("/");
      return Response.json({ revalidated: true });
    }

    return Response.json({ revalidated: false, message: "Colección no manejada" });

  } catch (error) {
    console.error("[revalidate]", error);
    return Response.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}