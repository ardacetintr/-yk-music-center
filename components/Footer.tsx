export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/70 bg-transparent">
      <div className="container flex flex-col items-center gap-1 py-3 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Öykü Music Center. Tüm hakları saklıdır.</p>
        <p>Designed by: AC Works</p>
      </div>
    </footer>
  );
}
