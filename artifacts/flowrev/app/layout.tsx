import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowRev",
  description: "一人でも回るAI運営システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
