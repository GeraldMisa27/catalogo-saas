import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-gray-500">
          © 2025 CatálogoSaaS — Todos los derechos reservados
        </p>
        <div className="flex gap-4">
          <Link href="/buscar" className="text-sm text-gray-500 hover:text-white">
            Explorar
          </Link>
          <Link href="/blog" className="text-sm text-gray-500 hover:text-white">
            Blog
          </Link>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-white">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}