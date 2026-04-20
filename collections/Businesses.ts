import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

// Hook que invalida el caché cuando un negocio se actualiza
const revalidateBusinessCache: CollectionAfterChangeHook = async ({ doc }) => {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: process.env.REVALIDATE_SECRET,
          collection: "businesses",
          slug: doc.slug,
        }),
      }
    );
  } catch (err) {
    console.error("[revalidate hook]", err);
  }
};

// Negocios — restaurantes, peluquerías, bodegas, etc.
// Cada negocio es un tenant de la plataforma
export const Businesses: CollectionConfig = {
  slug: "businesses",

  admin: {
    useAsTitle: "name",
    group: "Negocios",
    defaultColumns: ["name", "category", "zone", "status", "createdAt"],
  },

  access: {
    // Cualquiera puede leer negocios activos
    read: ({ req }) => {
      if (req.user) return true;
      return {
        status: { equals: "active" },
      };
    },
  },

  hooks: {
    afterChange: [revalidateBusinessCache],
  },

  fields: [
    // ── Información básica ──────────────────────────────
    {
      name: "name",
      type: "text",
      label: "Nombre del negocio",
      required: true,
    },
    {
      // Slug para la URL: /b/pizzeria-la-habana
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: {
        description: "URL del negocio — ej: pizzeria-la-habana",
      },
    },
    {
      // Logo del negocio
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo",
    },
    {
      // Foto de portada
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Foto de portada",
    },
    {
      // Descripción del negocio con rich text
      name: "description",
      type: "richText",
      label: "Descripción",
    },

    // ── Clasificación ───────────────────────────────────
    {
      // Categoría — Restaurante, Peluquería, etc.
      name: "category",
      type: "relationship",
      relationTo: "categories",
      label: "Categoría",
      required: true,
    },
    {
      // Zona — Centro Habana, Vedado, etc.
      name: "zone",
      type: "relationship",
      relationTo: "zones",
      label: "Zona",
      required: true,
    },

    // ── Contacto ────────────────────────────────────────
    {
      name: "phone",
      type: "text",
      label: "Teléfono",
    },
    {
      name: "whatsapp",
      type: "text",
      label: "WhatsApp",
    },
    {
      name: "instagram",
      type: "text",
      label: "Instagram",
      admin: {
        description: "Solo el usuario — ej: mi_negocio",
      },
    },
    {
      name: "telegram",
      type: "text",
      label: "Telegram",
    },

    // ── Ubicación ───────────────────────────────────────
    {
      name: "address",
      type: "text",
      label: "Dirección",
    },
    {
      // Campo custom que muestra el mapa interactivo
      // El dueño hace clic y las coordenadas se guardan automáticamente
      name: "locationPicker",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/payload/LocationPicker",
        },
      },
    },
    {
      name: "latitude",
      type: "number",
      label: "Latitud",
      admin: {
        // Oculta el campo — se llena automáticamente desde el mapa
        readOnly: true,
      },
    },
    {
      name: "longitude",
      type: "number",
      label: "Longitud",
      admin: {
        readOnly: true,
      },
    },

    // ── Servicios ───────────────────────────────────────
    {
      name: "hasDelivery",
      type: "checkbox",
      label: "Ofrece delivery",
      defaultValue: false,
    },
    {
      name: "hasPickup",
      type: "checkbox",
      label: "Permite recogida",
      defaultValue: true,
    },

    // ── Horario ─────────────────────────────────────────
    {
      name: "schedule",
      type: "textarea",
      label: "Horario",
      admin: {
        description: "Ej: Lun-Vie 9am-6pm, Sáb 9am-2pm",
      },
    },

    // ── Estado ──────────────────────────────────────────
    {
      name: "status",
      type: "select",
      label: "Estado",
      defaultValue: "pending",
      options: [
        { label: "Pendiente de aprobación", value: "pending" },
        { label: "Activo", value: "active" },
        { label: "Suspendido", value: "suspended" },
      ],
      admin: {
        description: "Solo el superadmin puede activar negocios",
      },
    },

    // ── Dueño ───────────────────────────────────────────
    {
      // El usuario que gestiona este negocio
      name: "owner",
      type: "relationship",
      relationTo: "users",
      label: "Dueño",
    },
  ],
};