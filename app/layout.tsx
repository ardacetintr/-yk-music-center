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

const AMBIENT_NOTES = [
  { symbol: "♪", left: "4%", top: "12%", size: "18px", duration: "5.5s", delay: "0s" },
  { symbol: "♫", left: "18%", top: "58%", size: "17px", duration: "6.2s", delay: "0.6s" },
  { symbol: "♬", left: "72%", top: "22%", size: "19px", duration: "5.8s", delay: "1.1s" },
  { symbol: "♩", left: "88%", top: "68%", size: "16px", duration: "6.5s", delay: "0.3s" },
  { symbol: "♪", left: "42%", top: "78%", size: "17px", duration: "5.4s", delay: "1.4s" },
  { symbol: "♫", left: "56%", top: "38%", size: "18px", duration: "6.1s", delay: "0.9s" },
  { symbol: "♬", left: "8%", top: "82%", size: "16px", duration: "5.9s", delay: "0.2s" },
  { symbol: "♩", left: "92%", top: "14%", size: "17px", duration: "6.3s", delay: "1.6s" }
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="font-sans antialiased">
      <body className="theme-night">
        <div aria-hidden className="global-background">
          <span className="global-blob global-blob-red" />
          <span className="global-blob global-blob-white" />
          <span className="global-blob global-blob-red-secondary" />
        </div>
        <div
          aria-hidden
          className="music-notes-layer pointer-events-none fixed inset-0 z-[1] overflow-hidden"
        >
          {AMBIENT_NOTES.map((note, index) => (
            <span
              key={`${note.symbol}-${index}`}
              className="music-note"
              style={{
                left: note.left,
                top: note.top,
                fontSize: note.size,
                animationDuration: note.duration,
                animationDelay: note.delay
              }}
            >
              {note.symbol}
            </span>
          ))}
        </div>
        <div className="site-shell relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="container flex flex-1 flex-col py-8">{children}</main>
          <ConditionalFooter />
        </div>
      </body>
    </html>
  );
}
