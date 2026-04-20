import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import NewProductForm from "./NewProductForm";

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

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const business = await getUserBusiness(user.id);
  if (!business) redirect("/dashboard");

  return <NewProductForm businessId={business.id} />;
}
