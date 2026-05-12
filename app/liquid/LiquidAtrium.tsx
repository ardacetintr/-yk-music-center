"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./liquid-atrium.module.css";

const TZ = "Europe/Istanbul";

const WAVE_PATH_A =
  "M0,72 C200,28 400,116 600,72 S1000,28 1200,72 L1200,120 L0,120 Z";

const WAVE_PATH_B =
  "M0,88 C220,48 380,108 600,80 S960,52 1200,86 L1200,120 L0,120 Z";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ
  }).format(d);
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: TZ
  }).format(d);
}

function WaveTrack({
  motion,
  fill,
  path,
  tall
}: {
  motion: "forward" | "reverse" | "mid" | "fast";
  fill: string;
  path: string;
  tall?: boolean;
}) {
  const trackClass =
    motion === "reverse"
      ? `${styles.waveTrack} ${styles.waveTrackReverse}`
      : motion === "mid"
        ? `${styles.waveTrack} ${styles.waveTrackMid}`
        : motion === "fast"
          ? `${styles.waveTrack} ${styles.waveTrackFast}`
          : `${styles.waveTrack} ${styles.waveTrackForward}`;

  const svgClass = [styles.waveSvg, tall ? styles.waveSvgTall : ""].filter(Boolean).join(" ");

  return (
    <div className={trackClass}>
      <svg className={svgClass} viewBox="0 0 2400 120" preserveAspectRatio="none" aria-hidden>
        <path d={path} fill={fill} />
        <path d={path} fill={fill} transform="translate(1200 0)" />
      </svg>
    </div>
  );
}

export default function LiquidAtrium() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`${styles.stage} min-h-0 flex-1`}>
      <div className={`${styles.glowOrb} ${styles.glowOrbBrand}`} aria-hidden />
      <div className={`${styles.glowOrb} ${styles.glowOrbWhite}`} aria-hidden />
      <div className={`${styles.glowOrb} ${styles.glowOrbZinc}`} aria-hidden />
      <div className={`${styles.glowOrb} ${styles.glowOrbBrandDeep}`} aria-hidden />

      <div className={styles.content}>
        <div className={styles.blobCluster}>
          <div className={styles.glassBlob}>
            <div className={styles.stack}>
              <div className={`${styles.row} ${styles.fadeUp}`}>
                <span className={styles.label}>Gün</span>
                <span className={`${styles.value} ${styles.dateValue}`}>{formatDate(now)}</span>
              </div>

              <hr className={styles.divider} />

              <div className={`${styles.row} ${styles.fadeUp} ${styles.fadeUpDelay1}`}>
                <span className={styles.label}>Saat</span>
                <span className={`${styles.value} ${styles.timeValue}`}>{formatTime(now)}</span>
              </div>

              <hr className={styles.divider} />

              <div className={`${styles.row} ${styles.fadeUp} ${styles.fadeUpDelay2}`}>
                <Link href="/admin" className={styles.tempoButton}>
                  Tempo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.waveShelf} aria-hidden>
        <div className={`${styles.waveShelfInner} ${styles.waveShelfInnerSlow}`}>
          <div className="absolute inset-0 translate-y-4">
            <WaveTrack motion="forward" fill="rgba(24,24,27,0.93)" path={WAVE_PATH_A} tall />
          </div>
        </div>
        <div className={styles.waveShelfInner}>
          <div className="absolute inset-0 translate-y-1">
            <WaveTrack motion="mid" fill="rgba(220,38,38,0.36)" path={WAVE_PATH_B} />
          </div>
        </div>
        <div className={styles.waveShelfInner}>
          <div className="absolute inset-0 -translate-y-1">
            <WaveTrack motion="reverse" fill="rgba(255,255,255,0.09)" path={WAVE_PATH_A} />
          </div>
        </div>
        <div className={`${styles.waveShelfInner} ${styles.waveShelfInnerSlow}`}>
          <div className="absolute inset-0 -translate-y-3 opacity-80">
            <WaveTrack motion="fast" fill="rgba(250,250,250,0.05)" path={WAVE_PATH_B} />
          </div>
        </div>
      </div>
    </div>
  );
}
