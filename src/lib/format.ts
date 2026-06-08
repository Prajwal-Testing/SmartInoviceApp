export function formatINR(n: number): string {
  if (!isFinite(n)) n = 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatNum(n: number, frac = 2): string {
  if (!isFinite(n)) n = 0;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: frac,
    maximumFractionDigits: frac,
  }).format(n);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}
function threeDigits(n: number): string {
  const h = Math.floor(n / 100), r = n % 100;
  const parts: string[] = [];
  if (h) parts.push(ONES[h] + " Hundred");
  if (r) parts.push(twoDigits(r));
  return parts.join(" ");
}

/** Indian numbering system: lakh, crore */
export function numberToWordsINR(amount: number): string {
  if (!isFinite(amount)) return "Zero Rupees Only";
  const sign = amount < 0 ? "Minus " : "";
  amount = Math.abs(amount);
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  const inWords = (n: number): string => {
    if (n === 0) return "Zero";
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const rest = n;
    const parts: string[] = [];
    if (crore) parts.push(twoDigits(crore) + " Crore");
    if (lakh) parts.push(twoDigits(lakh) + " Lakh");
    if (thousand) parts.push(twoDigits(thousand) + " Thousand");
    if (rest) parts.push(threeDigits(rest));
    return parts.join(" ").trim();
  };

  let out = sign + "Rupees " + inWords(rupees);
  if (paise > 0) out += " and " + twoDigits(paise) + " Paise";
  return out + " Only";
}

export function nextInvoiceNumber(existing: string[]): string {
  let max = 0;
  for (const n of existing) {
    const m = /INV-(\d+)/i.exec(n);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return "INV-" + String(max + 1).padStart(3, "0");
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
