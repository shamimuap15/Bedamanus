import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Local-development upload: saves to /public/uploads. Disabled on Vercel. */
export async function POST(req: Request) {
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_UPLOAD_MODE !== "local") {
    return NextResponse.json({ error: "Local uploads are disabled. Configure Vercel Blob." }, { status: 400 });
  }
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!/^(image|video)\//.test(file.type)) return NextResponse.json({ error: "Only images and videos" }, { status: 400 });

  const ext = (path.extname(file.name) || "").toLowerCase().replace(/[^.a-z0-9]/g, "");
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}
