import { gql } from "urql";

// Query para buscar negocios con filtros
// GraphQL permite pedir exactamente los campos que necesitamos
// Sin over-fetching — no traemos campos innecesarios
export const GET_BUSINESSES = gql`
  query GetBusinesses(
    $category: String
    $zone: String
    $limit: Int
  ) {
    Businesses(
      where: {
        status: { equals: active }
        AND: [
          { category__slug: { equals: $category } }
        ]
      }
      limit: $limit
    ) {
      docs {
        id
        name
        slug
        hasDelivery
        hasPickup
        coverImage {
          url
        }
        category {
          name
          slug
          icon
        }
        zone {
          name
          slug
        }
      }
      totalDocs
    }
  }
`;

// Query para obtener un negocio por slug
export const GET_BUSINESS_BY_SLUG = gql`
  query GetBusinessBySlug($slug: String!) {
    Businesses(
      where: {
        slug: { equals: $slug }
        status: { equals: active }
      }
      limit: 1
    ) {
      docs {
        id
        name
        slug
        phone
        whatsapp
        instagram
        telegram
        address
        schedule
        hasDelivery
        hasPickup
        coverImage { url }
        logo { url }
        category { name slug icon }
        zone { name slug }
      }
    }
  }
`;

// Query para obtener categorías
export const GET_CATEGORIES = gql`
  query GetCategories {
    Categories(limit: 50, sort: "name") {
      docs {
        id
        name
        slug
        icon
        description
      }
    }
  }
`;