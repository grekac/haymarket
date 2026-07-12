const SCAM_PATTERNS = [
  /перевед(и|ите).+на карту/i,
  /предоплат/i,
  /залог.+до.+встреч/i,
  /western union/i,
  /crypto|крипт/i,
  /telegram.+оплат/i,
  /срочно.+перевод/i,
];

export function scanMessageForScam(text: string): string | null {
  for (const p of SCAM_PATTERNS) {
    if (p.test(text)) {
      return "Возможное мошенничество: не переводите предоплату незнакомцам. Встречайтесь лично.";
    }
  }
  return null;
}

export const SAFETY_TIPS = [
  "Не переводите деньги до личной встречи и проверки товара",
  "Встречайтесь в людном месте или офисе HayMarket-партнёра",
  "Проверяйте документы на авто и недвижимость",
  "Используйте чат HayMarket — переписка сохраняется",
  "Жалуйтесь на подозрительные объявления — модераторы проверят",
];
