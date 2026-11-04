import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin – BedaManush", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-root lg:flex">
      <aside className="admin-side sticky top-0 z-30 flex flex-col gap-3 p-3 lg:h-screen lg:w-64 lg:flex-none lg:gap-6 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-lg font-extrabold">B</span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold text-white">BedaManush</span>
              <span className="block text-xs text-[#8b93a3]">Admin panel</span>
            </span>
          </Link>
          <form action={logout} className="lg:hidden"><button className="rounded-lg border border-white/15 px-3 py-1.5 text-sm font-semibold text-white">Log out</button></form>
        </div>
        <AdminNav />
        <div className="mt-auto hidden flex-col gap-2 lg:flex">
          <a href="/" target="_blank" rel="noreferrer" className="admin-navlink">↗ View live site</a>
          <form action={logout}><button className="admin-navlink w-full cursor-pointer">⎋ Log out</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex justify-end lg:hidden"><a href="/" target="_blank" rel="noreferrer" className="admin-btn-ghost no-underline">View site ↗</a></div>
          {children}
        </div>
      </main>
    </div>
  );
}
