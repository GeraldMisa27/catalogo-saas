import { getPayload } from "payload";
import config from "@payload-config";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditProductForm from "./EditProductForm";

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
      where: { owner: { equals: userId } },
      depth: 0,
      limit: 1,
    });
    return docs[0] ?? null;
  } catch {
    return null;
  }
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await getUserBusiness(user.id);
  if (!business) redirect("/dashboard");

  const payload = await getPayload({ config });
  let product;
  try {
    product = await payload.findByID({
      collection: "products",
      id,
      depth: 1,
    });
  } catch {
    notFound();
  }
  if (!product) notFound();

  const businessRef = product.business;
  const ownerBusinessId =
    typeof businessRef === "object" && businessRef && "id" in businessRef
      ? (businessRef as { id: string }).id
      : (businessRef as string);

  if (ownerBusinessId !== business.id) {
    notFound();
  }

  const img = product.image;
  const imageUrl =
    typeof img === "object" && img !== null && "url" in img
      ? ((img as { url?: string | null }).url ?? null)
      : null;

  return (
    <EditProductForm
      productId={id}
      initial={{
        name: product.name,
        description: product.description ?? "",
        price: String(product.price),
        productCategory: product.productCategory ?? "",
        available: product.available ?? true,
        order: String(product.order ?? 0),
      }}
      initialImageUrl={imageUrl}
    />
  );
}
