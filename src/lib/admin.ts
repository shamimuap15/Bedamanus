import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export async function isAdmin() {
  const jar = await cookies();
  return Boolean(await verifySessionToken(jar.get(SESSION_COOKIE)?.value));
}

/** Use at the top of every admin server action and admin page. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
