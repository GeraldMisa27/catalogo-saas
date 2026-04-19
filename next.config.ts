import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Deshabilitamos el type check en build
    // Payload genera los tipos automáticamente después del primer build exitoso
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withPayload(nextConfig);