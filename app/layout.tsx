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
  const notes = [
    { symbol: "♪", left: "1.5%", top: "5%", size: "18px", duration: "5s", delay: "0s" },
    { symbol: "♫", left: "12%", top: "28%", size: "20px", duration: "6.2s", delay: "0.8s" },
    { symbol: "♬", left: "22%", top: "52%", size: "17px", duration: "5.4s", delay: "0.2s" },
    { symbol: "♩", left: "31%", top: "74%", size: "16px", duration: "6.8s", delay: "1.1s" },
    { symbol: "♪", left: "40%", top: "40%", size: "19px", duration: "5.6s", delay: "0.5s" },
    { symbol: "♫", left: "50%", top: "66%", size: "21px", duration: "6.1s", delay: "1.6s" },
    { symbol: "♬", left: "59%", top: "18%", size: "18px", duration: "5.8s", delay: "0.4s" },
    { symbol: "♩", left: "68%", top: "84%", size: "16px", duration: "6.5s", delay: "1.2s" },
    { symbol: "♪", left: "76%", top: "36%", size: "20px", duration: "5.3s", delay: "0.7s" },
    { symbol: "♫", left: "84%", top: "58%", size: "18px", duration: "6s", delay: "1.4s" },
    { symbol: "♬", left: "98%", top: "22%", size: "17px", duration: "5.7s", delay: "0.9s" },
    { symbol: "♪", left: "7%", top: "46%", size: "16px", duration: "6.1s", delay: "0.4s" }
  ];
  const doubledNotes = [
    ...notes,
    ...notes.map((note, index) => ({
      ...note,
      left: `${(parseFloat(note.left) + 3 + (index % 5)) % 100}%`,
      top: `${(parseFloat(note.top) + 7 + (index % 6) * 2) % 100}%`,
      delay: `${parseFloat(note.delay) + 0.35}s`
    }))
  ];
  return (
    <html lang="tr" className="font-sans antialiased">
      <body className="theme-night">
        <div aria-hidden className="global-background">
          <span className="global-blob global-blob-red" />
          <span className="global-blob global-blob-white" />
          <span className="global-blob global-blob-black" />
          <span className="global-blob global-blob-red-secondary" />
          <span className="global-blob global-blob-dark-secondary" />
        </div>
        <div
          aria-hidden
          className="music-notes-layer pointer-events-none fixed inset-0 z-[1] overflow-hidden"
        >
          {doubledNotes.map((note, index) => (
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
