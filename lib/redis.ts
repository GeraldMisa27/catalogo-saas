import { Redis } from "@upstash/redis";

// Cliente Redis usando las variables de entorno de Upstash
// Se conecta automáticamente con REST API — no necesita puerto 6379
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});