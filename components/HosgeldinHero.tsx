import Link from "next/link";

type Props = {
  name: string;
};

export default function HosgeldinHero({ name }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 py-8 md:py-14">
      <div
        className="pointer-events-none absolute -left-28 top-4 h-80 w-80 rounded-full bg-brand-600/30 blur-[100px] animate-welcome-orb md:-left-16"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-brand-700/35 blur-[90px] animate-welcome-orb [animation-delay:2.5s]"
        aria-hidden
      />

      <span
        className="music-note left-[6%] top-[18%] text-xl opacity-60 md:left-[10%] md:text-2xl"
        aria-hidden
      >
        ♪
      </span>
      <span
        className="music-note right-[10%] top-[28%] text-lg opacity-50 [animation-delay:1.2s] md:text-xl"
        aria-hidden
      >
        ♫
      </span>
      <span
        className="music-note bottom-[22%] left-[14%] text-base opacity-45 [animation-delay:2s]"
        aria-hidden
      >
        ♬
      </span>

      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/[0.62] px-8 py-12 shadow-[0_6px_20px_rgba(0,0,0,0.14)] backdrop-blur-[10px] backdrop-saturate-[130%] md:px-14 md:py-16">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-brand-600/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 -translate-x-1/2 rounded-full bg-white/75 blur-3xl"
          aria-hidden
        />

        <p className="opacity-0 animate-welcome-fade-up text-center text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-600">
          Tempo Bilgi Sistemi
        </p>

        <div className="mt-8 text-center md:mt-10">
          <p className="opacity-0 animate-welcome-fade-up-delay text-[1.65rem] font-medium italic leading-snug tracking-[0.06em] text-zinc-900 md:text-[2.125rem] md:tracking-[0.07em]">
            Merhaba,
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.12] tracking-tight text-zinc-950 [text-shadow:0_1px_1px_rgba(255,255,255,0.95),0_2px_6px_rgba(0,0,0,0.14),0_4px_14px_rgba(0,0,0,0.1)] md:text-5xl md:leading-[1.1]">
            <span className="inline-block opacity-0 animate-welcome-fade-up-delay-2">
              <span className="text-zinc-950">{name}</span>
              <span
                className="text-zinc-800 [text-shadow:0_1px_1px_rgba(255,255,255,0.95),0_2px_6px_rgba(0,0,0,0.14)]"
                aria-hidden
              >
                .
              </span>
            </span>
          </h1>
          <div
            className="mx-auto mt-8 h-px max-w-[12rem] origin-center scale-x-0 bg-gradient-to-r from-transparent via-brand-600/45 to-transparent opacity-0 animate-welcome-line"
            aria-hidden
          />
        </div>

        <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/admin"
            className="group relative overflow-hidden rounded-xl bg-brand-600 px-8 py-3.5 text-center text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(220,38,38,0.22)] transition duration-300 hover:bg-brand-500 active:scale-[0.98]"
          >
            <span className="relative z-10">Yönetim paneline git</span>
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-full"
              aria-hidden
            />
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/45 bg-white/35 px-8 py-3.5 text-center text-[15px] font-medium text-zinc-900 backdrop-blur transition duration-300 hover:bg-white/50 active:scale-[0.98]"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
