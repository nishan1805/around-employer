/** Fixed clock so relative labels in the mock stay stable. */
export const APP_NOW = new Date("2026-10-28T12:00:00+05:30");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "—";
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function formatRelative(iso: string) {
  const days = Math.round((APP_NOW.getTime() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  return formatDate(iso);
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCount(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `+91 ${digits.slice(-10, -9)}XXXX XXXXX`;
}
