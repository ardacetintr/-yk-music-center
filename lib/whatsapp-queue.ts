import { buildWhatsAppSendUrl, type WhatsAppSendPayload } from "@/lib/whatsapp-url";

export type WhatsAppQueueTarget = {
  id: string;
  label: string;
  send: WhatsAppSendPayload;
};

function resolveWhatsAppUrl(target: string | WhatsAppSendPayload): string {
  return typeof target === "string" ? target : buildWhatsAppSendUrl(target);
}

/** Tek WhatsApp sekmesi — URL istemcide üretilir (emoji / Türkçe güvenli). */
export function openWhatsAppTab(target: string | WhatsAppSendPayload, uniqueKey: string): boolean {
  const url = resolveWhatsAppUrl(target);
  const windowName = `yk_wa_${uniqueKey}_${Date.now()}`;
  const popup = window.open(url, windowName, "noopener,noreferrer");
  if (popup && !popup.closed) return true;

  const link = document.createElement("a");
  link.href = url;
  link.target = windowName;
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

/**
 * Birden fazla sekme açmayı dener; çoğu tarayıcı yalnızca birine izin verir.
 * Geri kalanlar için toplu oturum + sekme odağı ile sıra kullanın.
 */
export function openWhatsAppTabs(targets: WhatsAppQueueTarget[]): number {
  let opened = 0;
  const stamp = Date.now();
  for (let i = 0; i < targets.length; i++) {
    const key = `${targets[i].id}_${stamp}_${i}`;
    if (openWhatsAppTab(targets[i].send, key)) opened += 1;
  }
  return opened;
}

export type BulkWhatsAppSession = {
  targets: WhatsAppQueueTarget[];
  index: number;
  lastOpenedAt: number;
};

export function createBulkWhatsAppSession(targets: WhatsAppQueueTarget[]): BulkWhatsAppSession | null {
  if (!targets.length) return null;
  return { targets, index: 0, lastOpenedAt: Date.now() };
}

/** Kullanıcı WhatsApp sekmesinden admin sekmesine döndüğünde sıradakini açar. */
export function advanceBulkWhatsAppSession(
  session: BulkWhatsAppSession
): { session: BulkWhatsAppSession; opened: WhatsAppQueueTarget | null; finished: boolean } {
  const elapsed = Date.now() - session.lastOpenedAt;
  if (elapsed < 1200) {
    return { session, opened: null, finished: false };
  }

  const nextIndex = session.index + 1;
  if (nextIndex >= session.targets.length) {
    return { session, opened: null, finished: true };
  }

  const target = session.targets[nextIndex];
  openWhatsAppTab(target.send, `${target.id}_${nextIndex}`);
  return {
    session: { ...session, index: nextIndex, lastOpenedAt: Date.now() },
    opened: target,
    finished: nextIndex >= session.targets.length - 1
  };
}
