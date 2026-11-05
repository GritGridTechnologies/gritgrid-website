function stripLeadingZeros(value: string) {
  return value.replace(/^0+(?=\d)/, "") || "0";
}

function normalizeCents(value: string) {
  const trimmed = String(value ?? "0").trim();
  const negative = trimmed.startsWith("-");
  const unsigned = trimmed.replace(/^[+-]/, "");
  const [wholeValue = "0", fractionValue = ""] = unsigned.split(".");
  const whole = wholeValue.replace(/\D/g, "") || "0";
  const fraction = `${fractionValue.replace(/\D/g, "")}00`.slice(0, 2);
  const digits = stripLeadingZeros(`${whole}${fraction}`);
  return { negative: negative && digits !== "0", digits };
}

function compareDigits(left: string, right: string) {
  const a = stripLeadingZeros(left);
  const b = stripLeadingZeros(right);
  if (a.length !== b.length) return a.length > b.length ? 1 : -1;
  return a === b ? 0 : a > b ? 1 : -1;
}

function addDigits(left: string, right: string) {
  let carry = 0;
  let result = "";
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;
  while (leftIndex >= 0 || rightIndex >= 0 || carry > 0) {
    const sum = Number(left[leftIndex] ?? 0) + Number(right[rightIndex] ?? 0) + carry;
    result = String(sum % 10) + result;
    carry = Math.floor(sum / 10);
    leftIndex -= 1;
    rightIndex -= 1;
  }
  return stripLeadingZeros(result);
}

function subtractDigits(left: string, right: string) {
  let borrow = 0;
  let result = "";
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;
  while (leftIndex >= 0) {
    let digit = Number(left[leftIndex]) - borrow - Number(right[rightIndex] ?? 0);
    if (digit < 0) {
      digit += 10;
      borrow = 1;
    } else {
      borrow = 0;
    }
    result = String(digit) + result;
    leftIndex -= 1;
    rightIndex -= 1;
  }
  return stripLeadingZeros(result);
}

function fromCents(negative: boolean, cents: string) {
  const padded = stripLeadingZeros(cents).padStart(3, "0");
  const whole = stripLeadingZeros(padded.slice(0, -2));
  const fraction = padded.slice(-2);
  return `${negative && cents !== "0" ? "-" : ""}${whole}.${fraction}`;
}

export function addMoneyStrings(values: readonly string[]) {
  const cents = values.reduce((total, value) => {
    const amount = normalizeCents(value);
    if (amount.negative) return subtractMoneyStrings(total, fromCents(false, amount.digits));
    return fromCents(false, addDigits(normalizeCents(total).digits, amount.digits));
  }, "0.00");
  return cents;
}

export function compareMoneyStrings(leftValue: string, rightValue: string) {
  const left = normalizeCents(leftValue);
  const right = normalizeCents(rightValue);
  if (left.negative !== right.negative) return left.negative ? -1 : 1;
  const comparison = compareDigits(left.digits, right.digits);
  return left.negative ? -comparison : comparison;
}

export function subtractMoneyStrings(leftValue: string, rightValue: string) {
  const left = normalizeCents(leftValue);
  const right = normalizeCents(rightValue);
  if (left.negative !== right.negative) {
    const sum = addDigits(left.digits, right.digits);
    return fromCents(left.negative, sum);
  }
  const comparison = compareDigits(left.digits, right.digits);
  if (comparison === 0) return "0.00";
  const bigger = comparison > 0 ? left : right;
  const smaller = comparison > 0 ? right : left;
  const negative = comparison > 0 ? left.negative : !left.negative;
  return fromCents(negative, subtractDigits(bigger.digits, smaller.digits));
}

function formatIndianInteger(value: string) {
  const digits = stripLeadingZeros(value);
  if (digits.length <= 3) return digits;
  const groups = [digits.slice(-3)];
  let remaining = digits.slice(0, -3);
  while (remaining.length > 2) {
    groups.unshift(remaining.slice(-2));
    remaining = remaining.slice(0, -2);
  }
  if (remaining) groups.unshift(remaining);
  return groups.join(",");
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

export function formatMoney(value: string, currency = "INR") {
  const normalized = normalizeCents(value);
  const padded = normalized.digits.padStart(3, "0");
  const whole = formatIndianInteger(padded.slice(0, -2));
  const fraction = padded.slice(-2);
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${normalized.negative ? "-" : ""}${symbol}${whole}.${fraction}`;
}

export function moneyToChartNumber(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}
