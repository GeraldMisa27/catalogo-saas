import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Users } from "./collections/Users.js";
import { Media } from "./collections/Media.js";
import { Zones } from "./collections/Zones.js";
import { Categories } from "./collections/Categories.js";
import { Articles } from "./collections/Articles.js";
import { Businesses } from "./collections/Businesses.js";
import { Products } from "./collections/Products.js";
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
        url: process.env.DATABASE_URL,
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
});
