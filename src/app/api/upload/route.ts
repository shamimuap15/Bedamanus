import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Issues short-lived Vercel Blob upload tokens so the admin's browser can upload
 * images/videos straight to Blob storage (no 4.5 MB serverless body limit).
 * Note: Vercel's "upload completed" callback has no admin cookie, which is why
 * auth is checked only when generating the token.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const jar = await cookies();
        if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) throw new Error("Not authorised");
        return {
          allowedContentTypes: ["image/*", "video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: 300 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
