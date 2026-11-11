"use client";

import { useRef, useState } from "react";
import { createPage } from "@/app/admin/actions";

type T = { key: string; label: string; description: string; mock: React.ReactNode };

export function NewPageDialog({ templates }: { templates: T[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  return (
    <>
      <button type="button" className="admin-btn" onClick={() => ref.current?.showModal()}>+ New page</button>
      <dialog
        ref={ref}
        onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
        className="m-auto w-[min(720px,calc(100vw-24px))] max-w-none rounded-[24px] border border-[#e7e5df] bg-white p-0 text-[#121214] shadow-[0_40px_100px_-30px_rgba(18,18,20,.5)] backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <form action={createPage} onSubmit={() => setPending(true)} className="flex max-h-[88vh] flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-[#efefec] p-5">
            <div>
              <h2 className="m-0 text-2xl font-extrabold tracking-tight">Create a landing page</h2>
              <p className="m-0 mt-1 text-sm text-[#6f6e76]">Pick a starting design. You can change everything afterwards in the editor.</p>
            </div>
            <button type="button" aria-label="Close" onClick={() => ref.current?.close()} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-[#f3f2ee]">✕</button>
          </div>
          <div className="flex flex-col gap-5 overflow-y-auto p-5">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">Page name<input name="title" required placeholder="e.g. Hair Brush" className="admin-input" /></label>
              <label className="flex flex-col gap-1 text-sm font-semibold"><span>URL slug <span className="font-normal text-[#6f6e76]">— optional</span></span><input name="slug" placeholder="hair-brush" className="admin-input" /></label>
            </div>
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 text-sm font-semibold">Template</legend>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {templates.map((t, i) => (
                  <label key={t.key} className="group flex cursor-pointer flex-col gap-2 rounded-2xl border-2 border-[#e7e5df] p-2.5 transition hover:border-[#bdbab0] has-[:checked]:border-[#121214] has-[:checked]:bg-[#faf9f6]">
                    <input type="radio" name="template" value={t.key} defaultChecked={i === 0} className="sr-only" />
                    {t.mock}
                    <span className="px-0.5">
                      <span className="block text-sm font-extrabold">{t.label}</span>
                      <span className="block text-xs leading-snug text-[#6f6e76]">{t.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-[#efefec] p-4">
            <button type="button" className="admin-btn-ghost" onClick={() => ref.current?.close()}>Cancel</button>
            <button className="admin-btn" disabled={pending}>{pending ? "Creating…" : "Create & open editor"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
