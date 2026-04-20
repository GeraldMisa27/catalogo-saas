// payload.config.ts
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";

// collections/Users.ts
var Users = {
  slug: "users",
  admin: {
    useAsTitle: "email"
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ]
};

// collections/Media.ts
var Media = {
  slug: "media",
  access: {
    read: () => true
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true
    }
  ],
  upload: true
};

// collections/Zones.ts
var Zones = {
  slug: "zones",
  admin: {
    useAsTitle: "name",
    group: "Contenido"
  },
  access: {
    read: () => true
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nombre",
      required: true
    },
    {
      // Slug — se usa en la URL: /zona/centro-habana
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true
    },
    {
      // Provincia a la que pertenece
      name: "province",
      type: "text",
      label: "Provincia",
      required: true,
      admin: {
        description: "Ej: La Habana, Santiago de Cuba, Villa Clara"
      }
    },
    {
      // Coordenadas del centro de la zona para el mapa
      name: "latitude",
      type: "number",
      label: "Latitud"
    },
    {
      name: "longitude",
      type: "number",
      label: "Longitud"
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripci\xF3n"
    }
  ]
};

// collections/Categories.ts
var Categories = {
  slug: "categories",
  // Nombre en el panel de administración
  admin: {
    useAsTitle: "name",
    group: "Contenido"
  },
  // Control de acceso — cualquiera puede leer, solo admins gestionan
  access: {
    read: () => true
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nombre",
      required: true
    },
    {
      // Slug — se usa en la URL: /categoria/restaurantes
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: {
        description: "URL amigable \u2014 ej: restaurantes, peluquerias, hoteles"
      }
    },
    {
      // Icono o emoji para mostrar en la UI
      name: "icon",
      type: "text",
      label: "Icono (emoji)",
      admin: {
        description: "Ej: \u{1F355} \u{1F37D}\uFE0F \u{1F487} \u{1F3E8}"
      }
    },
    {
      // Imagen de portada de la categoría
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Imagen"
    },
    {
      // Descripción para SEO
      name: "description",
      type: "textarea",
      label: "Descripci\xF3n"
    }
  ]
};

// collections/Articles.ts
var Articles = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    group: "Blog",
    // Vista previa del artículo
    defaultColumns: ["title", "status", "author", "publishedAt"]
  },
  access: {
    // Solo artículos publicados son visibles al público
    read: ({ req }) => {
      if (req.user) return true;
      return {
        status: { equals: "published" }
      };
    }
  },
  // Versionado — permite borradores antes de publicar
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "T\xEDtulo",
      required: true
    },
    {
      // Slug para la URL: /blog/mejores-restaurantes-habana
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true
    },
    {
      // Imagen de portada del artículo
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Imagen de portada",
      required: true
    },
    {
      // Descripción corta para SEO y cards
      name: "excerpt",
      type: "textarea",
      label: "Resumen",
      required: true,
      admin: {
        description: "Aparece en las cards y en los meta tags de SEO"
      }
    },
    {
      // Contenido del artículo con rich text — el valor de Payload
      name: "content",
      type: "richText",
      label: "Contenido",
      required: true
    },
    {
      // Categoría relacionada — ej: artículo sobre restaurantes
      name: "category",
      type: "relationship",
      relationTo: "categories",
      label: "Categor\xEDa"
    },
    {
      // Estado del artículo
      name: "status",
      type: "select",
      label: "Estado",
      defaultValue: "draft",
      options: [
        { label: "Borrador", value: "draft" },
        { label: "Publicado", value: "published" }
      ]
    },
    {
      // Fecha de publicación
      name: "publishedAt",
      type: "date",
      label: "Fecha de publicaci\xF3n",
      admin: {
        date: {
          pickerAppearance: "dayAndTime"
        }
      }
    }
  ]
};

// collections/Businesses.ts
var Businesses = {
  slug: "businesses",
  admin: {
    useAsTitle: "name",
    group: "Negocios",
    defaultColumns: ["name", "category", "zone", "status", "createdAt"]
  },
  access: {
    // Cualquiera puede leer negocios activos
    read: ({ req }) => {
      if (req.user) return true;
      return {
        status: { equals: "active" }
      };
    }
  },
  fields: [
    // ── Información básica ──────────────────────────────
    {
      name: "name",
      type: "text",
      label: "Nombre del negocio",
      required: true
    },
    {
      // Slug para la URL: /b/pizzeria-la-habana
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: {
        description: "URL del negocio \u2014 ej: pizzeria-la-habana"
      }
    },
    {
      // Logo del negocio
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Logo"
    },
    {
      // Foto de portada
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Foto de portada"
    },
    {
      // Descripción del negocio con rich text
      name: "description",
      type: "richText",
      label: "Descripci\xF3n"
    },
    // ── Clasificación ───────────────────────────────────
    {
      // Categoría — Restaurante, Peluquería, etc.
      name: "category",
      type: "relationship",
      relationTo: "categories",
      label: "Categor\xEDa",
      required: true
    },
    {
      // Zona — Centro Habana, Vedado, etc.
      name: "zone",
      type: "relationship",
      relationTo: "zones",
      label: "Zona",
      required: true
    },
    // ── Contacto ────────────────────────────────────────
    {
      name: "phone",
      type: "text",
      label: "Tel\xE9fono"
    },
    {
      name: "whatsapp",
      type: "text",
      label: "WhatsApp"
    },
    {
      name: "instagram",
      type: "text",
      label: "Instagram",
      admin: {
        description: "Solo el usuario \u2014 ej: mi_negocio"
      }
    },
    {
      name: "telegram",
      type: "text",
      label: "Telegram"
    },
    // ── Ubicación ───────────────────────────────────────
    {
      name: "address",
      type: "text",
      label: "Direcci\xF3n"
    },
    {
      // Campo custom que muestra el mapa interactivo
      // El dueño hace clic y las coordenadas se guardan automáticamente
      name: "locationPicker",
      type: "ui",
      admin: {
        components: {
          Field: "@/components/payload/LocationPicker"
        }
      }
    },
    {
      name: "latitude",
      type: "number",
      label: "Latitud",
      admin: {
        // Oculta el campo — se llena automáticamente desde el mapa
        readOnly: true
      }
    },
    {
      name: "longitude",
      type: "number",
      label: "Longitud",
      admin: {
        readOnly: true
      }
    },
    // ── Servicios ───────────────────────────────────────
    {
      name: "hasDelivery",
      type: "checkbox",
      label: "Ofrece delivery",
      defaultValue: false
    },
    {
      name: "hasPickup",
      type: "checkbox",
      label: "Permite recogida",
      defaultValue: true
    },
    // ── Horario ─────────────────────────────────────────
    {
      name: "schedule",
      type: "textarea",
      label: "Horario",
      admin: {
        description: "Ej: Lun-Vie 9am-6pm, S\xE1b 9am-2pm"
      }
    },
    // ── Estado ──────────────────────────────────────────
    {
      name: "status",
      type: "select",
      label: "Estado",
      defaultValue: "pending",
      options: [
        { label: "Pendiente de aprobaci\xF3n", value: "pending" },
        { label: "Activo", value: "active" },
        { label: "Suspendido", value: "suspended" }
      ],
      admin: {
        description: "Solo el superadmin puede activar negocios"
      }
    },
    // ── Dueño ───────────────────────────────────────────
    {
      // El usuario que gestiona este negocio
      name: "owner",
      type: "relationship",
      relationTo: "users",
      label: "Due\xF1o"
    }
  ]
};

// collections/Products.ts
var Products = {
  slug: "products",
  admin: {
    useAsTitle: "name",
    group: "Negocios",
    defaultColumns: ["name", "business", "price", "available", "createdAt"]
  },
  access: {
    // Cualquiera puede leer productos disponibles
    read: ({ req }) => {
      if (req.user) return true;
      return {
        available: { equals: true }
      };
    }
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nombre del producto",
      required: true
    },
    {
      // Imagen del producto
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Imagen"
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripci\xF3n"
    },
    {
      name: "price",
      type: "number",
      label: "Precio",
      required: true,
      admin: {
        description: "Precio en CUP"
      }
    },
    {
      // Negocio al que pertenece este producto
      name: "business",
      type: "relationship",
      relationTo: "businesses",
      label: "Negocio",
      required: true
    },
    {
      // Categoría del producto dentro del negocio
      // ej: Entradas, Platos principales, Postres
      name: "productCategory",
      type: "text",
      label: "Categor\xEDa del producto",
      admin: {
        description: "Ej: Entradas, Platos principales, Bebidas"
      }
    },
    {
      // Si está disponible para mostrar al público
      name: "available",
      type: "checkbox",
      label: "Disponible",
      defaultValue: true
    },
    {
      // Orden de aparición en el catálogo
      name: "order",
      type: "number",
      label: "Orden",
      defaultValue: 0,
      admin: {
        description: "N\xFAmero menor aparece primero"
      }
    }
  ]
};

// payload.config.ts
import { uploadthingStorage } from "@payloadcms/storage-uploadthing";
var projectRoot = path.resolve(process.cwd());
var payload_config_default = buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: projectRoot
    }
  },
  collections: [
    Users,
    Media,
    Categories,
    Zones,
    Articles,
    Businesses,
    Products
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(projectRoot, "payload-types.ts")
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL
  }),
  sharp,
  plugins: [
    uploadthingStorage({
      collections: {
        media: true
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: "public-read"
      }
    })
  ],
  graphQL: {
    schemaOutputFile: path.resolve(projectRoot, "generated-schema.graphql"),
    disablePlaygroundInProduction: false
    // habilita el playground
  }
});
export {
  payload_config_default as default
};
