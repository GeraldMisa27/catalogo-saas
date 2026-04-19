// Categorías de negocios — Restaurante, Peluquería, Hotel, etc.
// El superadmin las gestiona desde el panel de Payload
export const Categories = {
    slug: "categories",
    // Nombre en el panel de administración
    admin: {
        useAsTitle: "name",
        group: "Contenido",
    },
    // Control de acceso — cualquiera puede leer, solo admins gestionan
    access: {
        read: () => true,
    },
    fields: [
        {
            name: "name",
            type: "text",
            label: "Nombre",
            required: true,
        },
        {
            // Slug — se usa en la URL: /categoria/restaurantes
            name: "slug",
            type: "text",
            label: "Slug",
            required: true,
            unique: true,
            admin: {
                description: "URL amigable — ej: restaurantes, peluquerias, hoteles",
            },
        },
        {
            // Icono o emoji para mostrar en la UI
            name: "icon",
            type: "text",
            label: "Icono (emoji)",
            admin: {
                description: "Ej: 🍕 🍽️ 💇 🏨",
            },
        },
        {
            // Imagen de portada de la categoría
            name: "image",
            type: "upload",
            relationTo: "media",
            label: "Imagen",
        },
        {
            // Descripción para SEO
            name: "description",
            type: "textarea",
            label: "Descripción",
        },
    ],
};
