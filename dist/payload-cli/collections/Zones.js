// Zonas geográficas — Centro Habana, Vedado, Miramar, etc.
// El superadmin las gestiona desde el panel de Payload
export const Zones = {
    slug: "zones",
    admin: {
        useAsTitle: "name",
        group: "Contenido",
    },
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
            // Slug — se usa en la URL: /zona/centro-habana
            name: "slug",
            type: "text",
            label: "Slug",
            required: true,
            unique: true,
        },
        {
            // Provincia a la que pertenece
            name: "province",
            type: "text",
            label: "Provincia",
            required: true,
            admin: {
                description: "Ej: La Habana, Santiago de Cuba, Villa Clara",
            },
        },
        {
            // Coordenadas del centro de la zona para el mapa
            name: "latitude",
            type: "number",
            label: "Latitud",
        },
        {
            name: "longitude",
            type: "number",
            label: "Longitud",
        },
        {
            name: "description",
            type: "textarea",
            label: "Descripción",
        },
    ],
};
