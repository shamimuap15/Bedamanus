"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="admin-root flex items-center justify-center p-4" style={{ background: "radial-gradient(900px 520px at 50% -8%, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 65%), #f3f2ee" }}>
      <form action={action} className="flex w-full max-w-sm flex-col gap-4 rounded-[28px] border border-[#e7e5df] bg-white p-9 shadow-[0_30px_80px_-30px_rgba(18,18,20,.35)]">
        <div>
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-xl font-extrabold">B</span>
          <h1 className="m-0 text-3xl">BedaManush Admin</h1>
          <p className="m-0 text-sm text-[#666]">Sign in to manage the landing page and orders.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Username
          <input name="username" autoComplete="username" required defaultValue={state?.username ?? ""} className="admin-input" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Password
          <input name="password" type="password" autoComplete="current-password" required className="admin-input" />
        </label>
        {state?.error && <p role="alert" className="m-0 rounded-md bg-[#fdecea] px-3 py-2 text-sm text-[#b42318]">{state.error}</p>}
        <button className="admin-btn" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
