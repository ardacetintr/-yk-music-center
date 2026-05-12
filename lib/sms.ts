/**
 * Twilio REST ile SMS. Ortam: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER (+15551234567 biçimi).
 */

export type SmsResult = { ok: true } | { ok: false; reason: string };

export async function sendVerificationSms(e164To: string, messageBody: string): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!sid || !token || !from) {
    return { ok: false, reason: "missing_config" };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const params = new URLSearchParams({
      To: e164To,
      From: from,
      Body: messageBody
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, reason: text.slice(0, 240) };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}
