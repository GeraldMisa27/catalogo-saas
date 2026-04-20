declare module "next-pwa" {
  import type { NextConfig } from "next";

  export interface NextPWAOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
  }

  function withPWA(
    options?: NextPWAOptions
  ): (config: NextConfig) => NextConfig;

  export default withPWA;
}
