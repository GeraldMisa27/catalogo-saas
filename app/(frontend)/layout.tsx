import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CatálogoSaaS — Encuentra negocios cerca de ti",
    template: "%s | CatálogoSaaS",
  },
  description:
    "Encuentra restaurantes, peluquerías, bodegas y más negocios cerca de ti. Catálogos digitales con precios, fotos y contacto directo.",
  openGraph: {
    type: "website",
    locale: "es_CU",
    siteName: "CatálogoSaaS",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}