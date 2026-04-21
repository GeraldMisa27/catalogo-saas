import { getPayload } from "payload";
import config from "@payload-config";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getMediaDisplayUrl } from "@/lib/mediaUrl";
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

  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const siteOrigin =
    host ?
      `${proto}://${host}`
    : (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "");

  let imageUrl = getMediaDisplayUrl(product.image, siteOrigin);
  if (!imageUrl && typeof product.image === "string") {
    try {
      const mediaDoc = await payload.findByID({
        collection: "media",
        id: product.image,
        depth: 0,
      });
      imageUrl = getMediaDisplayUrl(mediaDoc, siteOrigin);
    } catch {
      imageUrl = null;
    }
  }

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
