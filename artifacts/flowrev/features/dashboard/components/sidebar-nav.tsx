"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarNavProps {
  brand: string;
  items: NavItem[];
  userName: string | null;
  userEmail: string | null;
}

export function SidebarNav({
  brand,
  items,
  userName,
  userEmail,
}: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col">
      {/* ロゴ / ブランド */}
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg tracking-tight">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
            <div className="w-3.5 h-3.5 bg-white rounded-sm" />
          </div>
          {brand}
        </div>
      </div>

      {/* ナビリンク */}
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={[
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-700 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-0.5 after:bg-emerald-600 after:rounded-r-full"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                <span className={["text-base leading-none", active ? "opacity-100" : "opacity-60"].join(" ")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ユーザー情報 */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
            {(userName ?? userEmail ?? "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {userName ?? userEmail ?? "—"}
            </p>
            {userName && userEmail && (
              <p className="truncate text-xs text-slate-500">{userEmail}</p>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
