/** SMS через Twilio (если настроен) или dev-режим */

export async function sendSms(phone: string, message: string): Promise<{ sent: boolean; devCode?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[sms:dev] ${phone}: ${message}`);
      const match = message.match(/\d{6}/);
      return { sent: false, devCode: match?.[0] };
    }
    return { sent: false };
  }

  const body = new URLSearchParams({
    To: phone.replace(/\s/g, ""),
    From: from,
    Body: message,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  return { sent: res.ok };
}
