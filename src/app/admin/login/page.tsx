"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="admin-root flex items-center justify-center p-4">
      <form action={action} className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[#e4e4e0] bg-white p-6 shadow-sm">
        <div>
          <h1 className="m-0 text-xl font-bold">BedaManush Admin</h1>
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
