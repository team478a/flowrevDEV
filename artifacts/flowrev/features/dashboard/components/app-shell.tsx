"use client";

import { useState } from "react";
import { SidebarNav, type NavItem } from "./sidebar-nav";
import { logout } from "@/features/auth/actions";

interface AppShellProps {
  brand: string;
  items: NavItem[];
  userName: string | null;
  userEmail: string | null;
  children: React.ReactNode;
}

export function AppShell({
  brand,
  items,
  userName,
  userEmail,
  children,
}: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* サイドバー（デスクトップ） */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <SidebarNav
          brand={brand}
          items={items}
          userName={userName}
          userEmail={userEmail}
        />
        <div className="px-4 pb-4">
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* モバイル：ハンバーガー＋ドロワー */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-border bg-card transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarNav
          brand={brand}
          items={items}
          userName={userName}
          userEmail={userEmail}
        />
        <div className="px-4 pb-4">
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* メインエリア */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* モバイルヘッダー */}
        <header className="flex h-14 items-center border-b border-border bg-card px-4 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mr-3 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="メニューを開く"
          >
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current" />
          </button>
          <span className="text-sm font-bold">{brand}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
