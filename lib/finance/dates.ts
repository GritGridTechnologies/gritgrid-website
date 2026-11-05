import { isValidFinanceDate } from "./validation";

export function getIndiaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function shiftFinanceDate(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function financeWeekStart(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return shiftFinanceDate(dateValue, -daysSinceMonday);
}

export function financeMonthStart(dateValue: string) {
  return `${dateValue.slice(0, 7)}-01`;
}

export function financeYearStart(dateValue: string) {
  return `${dateValue.slice(0, 4)}-01-01`;
}

export function financeMonthKey(dateValue: string, offset: number) {
  const [year, month] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function financeMonthDays(yearMonth: string) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function financeDaysBetween(startDate: string, endDate: string) {
  if (!isValidFinanceDate(startDate) || !isValidFinanceDate(endDate) || startDate > endDate) return 0;
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.floor((end - start) / 86_400_000) + 1;
}

export function formatFinanceDate(dateValue: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!isValidFinanceDate(dateValue)) return dateValue;
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "Asia/Kolkata" }).format(new Date(`${dateValue}T12:00:00.000Z`));
}

export function financeDateRangeLabel(startDate: string, endDate: string) {
  return startDate === endDate
    ? formatFinanceDate(startDate)
    : `${formatFinanceDate(startDate)} – ${formatFinanceDate(endDate)}`;
}
