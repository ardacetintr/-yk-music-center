/**
 * Tam genişlik; kök `main` ile birlikte kalan dikey alanı doldurur (footer yok).
 */
export default function LiquidLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-liquid-page
      className="relative left-1/2 flex w-screen max-w-[100vw] min-h-0 flex-1 -translate-x-1/2 flex-col -my-8 overflow-x-hidden"
    >
      {children}
    </div>
  );
}
