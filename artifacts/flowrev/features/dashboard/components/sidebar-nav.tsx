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
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <span className="text-base font-bold tracking-tight text-foreground">
          {brand}
        </span>
      </div>

      {/* ナビリンク */}
      <ul className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
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
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                ].join(" ")}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* ユーザー情報 */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="truncate text-sm font-medium text-foreground">
          {userName ?? userEmail ?? "—"}
        </p>
        {userName && userEmail && (
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        )}
      </div>
    </nav>
  );
}
