import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Hace que el admin de Payload tenga una miniatura consistente.
    adminThumbnail: 'thumb',
    imageSizes: [
      {
        name: 'thumb',
        width: 320,
        height: 320,
        fit: 'cover',
      },
    ],
  },
}
