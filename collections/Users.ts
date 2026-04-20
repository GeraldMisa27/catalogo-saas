import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
      label: "Nombre",
    },
    {
      name: "role",
      type: "select",
      label: "Rol",
      required: true,
      defaultValue: "business-owner",
      options: [
        { label: "Dueño de negocio", value: "business-owner" },
        { label: "Administrador", value: "admin" },
      ],
      admin: {
        position: "sidebar",
      },
    },
  ],
}
