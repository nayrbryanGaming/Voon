import { auth } from "@/auth";

export async function getServerSession() {
  return auth();
}

export async function getServerUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
