import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

// SSR — cada usuario ve sus propios datos
export const dynamic = "force-dynamic";

async function getCurrentUser() {
  try {
    const payload = await getPayload({ config });
    const cookieStore = await cookies();

    const { user } = await payload.auth({
      headers: new Headers({
        cookie: cookieStore.toString(),
      }),
    });

    return user;
  } catch {
    return null;
  }
}

async function getUserBusiness(userId: string) {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "businesses",
      where: {
        owner: { equals: userId },
      },
      depth: 1,
      limit: 1,
    });
    return docs[0] ?? null;
  } catch {
    return null;
  }
}

async function getBusinessProducts(businessId: string) {
  try {
    const payload = await getPayload({ config });
    const { docs, totalDocs } = await payload.find({
      collection: "products",
      where: {
        business: { equals: businessId },
      },
      limit: 100,
      sort: "order",
    });
    return { products: docs, total: totalDocs };
  } catch {
    return { products: [], total: 0 };
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  // Si no está autenticado redirige al login
  if (!user) redirect("/login");

  const business = await getUserBusiness(user.id);
  const { products, total } = business
    ? await getBusinessProducts(business.id)
    : { products: [], total: 0 };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* ── Header ───────────────────────────────────── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Mi Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Bienvenido, {user.email}
            </p>
          </div>
          <form action="/api/users/logout" method="POST">
            <button
              type="submit"
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {business ? (
          <>
            {/* ── Stats ──────────────────────────────────── */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-gray-900 p-5">
                <p className="text-sm text-gray-400">Productos</p>
                <p className="text-3xl font-bold text-white mt-1">{total}</p>
              </div>
              <div className="rounded-xl bg-gray-900 p-5">
                <p className="text-sm text-gray-400">Estado</p>
                <p className={`text-lg font-semibold mt-1 ${
                  business.status === "active"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}>
                  {business.status === "active" ? "✅ Activo" : "⏳ Pendiente"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-900 p-5">
                <p className="text-sm text-gray-400">URL pública</p>
                <Link
                  href={`/b/${business.slug}`}
                  className="text-indigo-400 text-sm hover:text-indigo-300 mt-1 block"
                  target="_blank"
                >
                  /b/{business.slug} →
                </Link>
              </div>
            </div>

            {/* ── Productos ──────────────────────────────── */}
            <div className="rounded-xl bg-gray-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Mis productos
                </h2>
                <Link
                  href="/dashboard/productos/nuevo"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                >
                  + Añadir producto
                </Link>
              </div>

              {products.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-xl bg-gray-800 px-4 py-3"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          ${product.price} CUP
                          {product.productCategory &&
                            ` · ${product.productCategory}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs ${
                          product.available
                            ? "text-green-400"
                            : "text-gray-500"
                        }`}>
                          {product.available ? "Disponible" : "No disponible"}
                        </span>
                        <Link
                          href={`/dashboard/productos/${product.id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Editar
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No tienes productos aún.{" "}
                  <Link
                    href="/dashboard/productos/nuevo"
                    className="text-indigo-400 hover:text-indigo-300"
                  >
                    Añade el primero
                  </Link>
                </p>
              )}
            </div>
          </>
        ) : (
          /* Si el usuario no tiene negocio asignado */
          <div className="rounded-xl bg-gray-900 p-8 text-center">
            <p className="text-gray-400 text-lg">
              No tienes un negocio asignado aún.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Contacta al administrador para que te asigne tu negocio.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}