import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin – BedaManush", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-root">
      <header className="sticky top-0 z-30 border-b border-[#e4e4e0] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/admin" className="text-lg font-bold text-[#1f1f1f] no-underline">BedaManush Admin</Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="admin-btn-ghost no-underline">View site ↗</a>
            <form action={logout}><button className="admin-btn-ghost">Log out</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
