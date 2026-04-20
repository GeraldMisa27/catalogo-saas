import { createClient, cacheExchange, fetchExchange } from "urql";

// Cliente GraphQL que apunta al endpoint de Payload
// Urql es más ligero que Apollo — suficiente para este proyecto
export const graphqlClient = createClient({
  url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/graphql`,
  exchanges: [cacheExchange, fetchExchange],
});