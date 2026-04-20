import Link from "next/link";

export default function RegistroExitosoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          ¡Registro exitoso!
        </h1>
        <p className="text-gray-400 mb-2">
          Tu negocio ha sido registrado correctamente.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Estará visible en la plataforma una vez que el equipo lo apruebe.
          Te notificaremos por email cuando esté activo.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Acceder a mi panel
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}