"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const LOCAL = process.env.NEXT_PUBLIC_UPLOAD_MODE === "local";

async function uploadFile(file: File, onProgress: (pct: number) => void): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "-").toLowerCase();
  if (LOCAL) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-local", { method: "POST", body: fd });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Upload failed");
    return (await res.json()).url;
  }
  const blob = await upload(`landing/${safeName}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    multipart: file.size > 20 * 1024 * 1024,
    onUploadProgress: (e) => onProgress(Math.round(e.percentage)),
  });
  return blob.url;
}

export function MediaInput({
  id,
  value,
  onChange,
  kind,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  kind: "image" | "video";
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (kind === "image" && f.size > 8 * 1024 * 1024) return setErr("Image is larger than 8 MB — please compress it first.");
    if (kind === "video" && f.size > 300 * 1024 * 1024) return setErr("Video is larger than 300 MB.");
    setErr("");
    setBusy(true);
    setPct(0);
    try {
      onChange(await uploadFile(f, setPct));
    } catch (ex) {
      setErr((ex as Error).message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-lg border border-[#e4e4e0] bg-[#efede8]">
          {value ? (
            kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            ) : (
              <video src={value} className="h-full w-full object-cover" muted preload="metadata" />
            )
          ) : (
            <span className="text-xs text-[#888]">No {kind}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Paste ${kind} URL or upload`} className="admin-input" />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="admin-btn-ghost" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? `Uploading… ${pct ? pct + "%" : ""}` : `Upload ${kind}`}
            </button>
            {value && (
              <button type="button" className="admin-btn-ghost admin-btn-danger" onClick={() => onChange("")}>Remove</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept={kind === "image" ? "image/*" : "video/mp4,video/webm,video/quicktime"} className="hidden" onChange={onFile} />
          {err && <span className="text-sm text-[#b42318]">{err}</span>}
        </div>
      </div>
    </div>
  );
}
