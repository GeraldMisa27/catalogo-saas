import { getPayload } from "payload";
import config from "@payload-config";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerName,
      email,
      password,
      businessName,
      slug,
      phone,
      whatsapp,
      address,
      categoryId,
      zoneId,
      hasDelivery,
      hasPickup,
      schedule,
    } = body;

    // Validaciones básicas
    if (!ownerName || !email || !password || !businessName || !slug) {
      return Response.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    if (!categoryId || !zoneId) {
      return Response.json(
        { error: "Debes elegir categoría y zona" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "La contraseña debe tener mínimo 8 caracteres" },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

    // 1. Verifica que el slug no esté en uso
    const existing = await payload.find({
      collection: "businesses",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      return Response.json(
        { error: "Ya existe un negocio con ese nombre. Intenta con otro." },
        { status: 400 }
      );
    }

    // 2. Crea el usuario dueño
    const user = await payload.create({
      collection: "users",
      data: {
        name: ownerName,
        email,
        password,
        role: "business-owner",
      },
    });

    // 3. Crea el negocio con estado pending
    // El superadmin lo activa desde el panel de Payload
    await payload.create({
      collection: "businesses",
      draft: false,
      data: {
        name: businessName,
        slug,
        category: categoryId,
        zone: zoneId,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        address: address || undefined,
        schedule: schedule || undefined,
        hasDelivery: Boolean(hasDelivery),
        hasPickup: hasPickup !== false,
        status: "pending", // pendiente de aprobación
        owner: user.id, // vincula el negocio al dueño
      },
    });

    return Response.json(
      { success: true, message: "Negocio registrado correctamente" },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error("[register]", error);

    // Error de email duplicado
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: string }).message === "string" &&
      (error as { message: string }).message.includes("duplicate")
    ) {
      return Response.json(
        { error: "Ya existe una cuenta con ese email" },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}