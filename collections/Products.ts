import type { CollectionConfig } from "payload";

// Productos de cada negocio — platos, servicios, artículos, etc.
export const Products: CollectionConfig = {
  slug: "products",

  admin: {
    useAsTitle: "name",
    group: "Negocios",
    defaultColumns: ["name", "business", "price", "available", "createdAt"],
  },

  access: {
    // Cualquiera puede leer productos disponibles
    read: ({ req }) => {
      if (req.user) return true;
      return {
        available: { equals: true },
      };
    },
  },

  fields: [
    {
      name: "name",
      type: "text",
      label: "Nombre del producto",
      required: true,
    },
    {
      // Imagen del producto
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Imagen",
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción",
    },
    {
      name: "price",
      type: "number",
      label: "Precio",
      required: true,
      admin: {
        description: "Precio en CUP",
      },
    },
    {
      // Negocio al que pertenece este producto
      name: "business",
      type: "relationship",
      relationTo: "businesses",
      label: "Negocio",
      required: true,
    },
    {
      // Categoría del producto dentro del negocio
      // ej: Entradas, Platos principales, Postres
      name: "productCategory",
      type: "text",
      label: "Categoría del producto",
      admin: {
        description: "Ej: Entradas, Platos principales, Bebidas",
      },
    },
    {
      // Si está disponible para mostrar al público
      name: "available",
      type: "checkbox",
      label: "Disponible",
      defaultValue: true,
    },
    {
      // Orden de aparición en el catálogo
      name: "order",
      type: "number",
      label: "Orden",
      defaultValue: 0,
      admin: {
        description: "Número menor aparece primero",
      },
    },
  ],
};