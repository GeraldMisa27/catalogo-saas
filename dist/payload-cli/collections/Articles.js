// Artículos del blog — "Los mejores restaurantes de La Habana"
// Aquí Payload brilla — rich text con imágenes, videos y formato
export const Articles = {
    slug: "articles",
    admin: {
        useAsTitle: "title",
        group: "Blog",
        // Vista previa del artículo
        defaultColumns: ["title", "status", "author", "publishedAt"],
    },
    access: {
        // Solo artículos publicados son visibles al público
        read: ({ req }) => {
            if (req.user)
                return true; // admins ven todo
            return {
                status: { equals: "published" },
            };
        },
    },
    // Versionado — permite borradores antes de publicar
    versions: {
        drafts: true,
    },
    fields: [
        {
            name: "title",
            type: "text",
            label: "Título",
            required: true,
        },
        {
            // Slug para la URL: /blog/mejores-restaurantes-habana
            name: "slug",
            type: "text",
            label: "Slug",
            required: true,
            unique: true,
        },
        {
            // Imagen de portada del artículo
            name: "coverImage",
            type: "upload",
            relationTo: "media",
            label: "Imagen de portada",
            required: true,
        },
        {
            // Descripción corta para SEO y cards
            name: "excerpt",
            type: "textarea",
            label: "Resumen",
            required: true,
            admin: {
                description: "Aparece en las cards y en los meta tags de SEO",
            },
        },
        {
            // Contenido del artículo con rich text — el valor de Payload
            name: "content",
            type: "richText",
            label: "Contenido",
            required: true,
        },
        {
            // Categoría relacionada — ej: artículo sobre restaurantes
            name: "category",
            type: "relationship",
            relationTo: "categories",
            label: "Categoría",
        },
        {
            // Estado del artículo
            name: "status",
            type: "select",
            label: "Estado",
            defaultValue: "draft",
            options: [
                { label: "Borrador", value: "draft" },
                { label: "Publicado", value: "published" },
            ],
        },
        {
            // Fecha de publicación
            name: "publishedAt",
            type: "date",
            label: "Fecha de publicación",
            admin: {
                date: {
                    pickerAppearance: "dayAndTime",
                },
            },
        },
    ],
};
