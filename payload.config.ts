import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Zones } from "./collections/Zones";
import { Categories } from "./collections/Categories";
import { Articles } from "./collections/Articles";
import { Businesses } from "./collections/Businesses";
import { Products } from "./collections/Products";
import { uploadthingStorage } from "@payloadcms/storage-uploadthing";

const projectRoot = path.resolve(process.cwd());

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: projectRoot,
    },
  },
  collections: [
    Users,
    Media,
    Categories,
    Zones,
    Articles,
    Businesses,
    Products,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(projectRoot, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL!,
  }),
  sharp,
  plugins: [
    uploadthingStorage({
      collections: {
        media: true,
      },
      options: {
        token: process.env.UPLOADTHING_TOKEN,
        acl: "public-read",
      },
    }),
  ],
  graphQL: {
    schemaOutputFile: path.resolve(projectRoot, "generated-schema.graphql"),
    disablePlaygroundInProduction: false, // habilita el playground
  },
});
