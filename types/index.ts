// Tipo para los datos de negocio que vienen de la API REST
export type BusinessFromAPI = {
  id: string;
  name: string;
  slug: string;
  coverImage?: { url: string } | null;
  category?: { name: string } | null;
  zone?: { name: string } | null;
  hasDelivery?: boolean;
  hasPickup?: boolean;
};

export type ProductFromAPI = {
  id: string;
  name: string;
  price: number;
  image?: { url?: string | null } | null;
  business: {
    id: string;
    name: string;
    slug: string;
  };
};