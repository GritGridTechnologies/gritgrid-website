export function isFinanceSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expectedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !expectedHost) return false;
  try {
    return new URL(origin).host.toLowerCase() === expectedHost.split(",")[0].trim().toLowerCase();
  } catch {
    return false;
  }
}

export function financeAccessStatus(kind: "anonymous" | "password-change" | "forbidden") {
  return kind === "anonymous" ? 401 : 403;
}
