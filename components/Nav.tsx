import Link from "next/link";

export default function Nav() {
    return (
        <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-white">
                    Catálogo<span className="text-indigo-400">SaaS</span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/buscar"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Explorar
                    </Link>
                    <Link
                        href="/blog"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Blog
                    </Link>
                    <Link
                        href="/dashboard"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                    >
                        Mi negocio
                    </Link>
                    <Link
                        href="/registro"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                    >
                        Registra tu negocio
                    </Link>
                </div>
            </div>
        </nav>
    );
}