import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";

export const metadata: Metadata = {
  title: "Öykü Music Center",
  description: "Müzik okulu yönetim sistemi",
  icons: {
    icon: [{ url: "/logo-oyku.png", type: "image/png" }],
    shortcut: "/logo-oyku.png",
    apple: "/logo-oyku.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="font-sans antialiased">
      <body className="theme-night">
        <div className="site-bg" aria-hidden />
        <div className="site-shell relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="container flex flex-1 flex-col py-8">{children}</main>
          <ConditionalFooter />
        </div>
      </body>
    </html>
  );
}
