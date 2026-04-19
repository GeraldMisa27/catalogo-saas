import type { CollectionConfig } from "payload";

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
      // Coordenadas para el mapa — Mapbox
      name: "latitude",
      type: "number",
      label: "Latitud",
    },
    {
      name: "longitude",
      type: "number",
      label: "Longitud",
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