import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const betterAuthHandler = toNextJsHandler(auth);

function errorDetails(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { name: "UnknownError", message: String(error), stack: undefined };
}

async function withDiagnostics(handler: (request: Request) => Response | Promise<Response>, request: Request) {
  const path = new URL(request.url).pathname;
  try {
    const response = await handler(request);
    console.info("[auth-diagnostic] request", { method: request.method, path, status: response.status });
    if (path.endsWith("/sign-up/email") && response.status >= 500) {
      const diagnostic = (globalThis as typeof globalThis & { __gritgridAuthDiagnostic?: { id: string; operation: string; name: string; message: string } }).__gritgridAuthDiagnostic;
      const id = diagnostic?.id ?? `SIGNUP_DIAGNOSTIC_${Date.now().toString(36).toUpperCase()}`;
      const safeMessage = diagnostic ? `${diagnostic.name}: ${diagnostic.message}` : "No database exception was captured; inspect the server-side diagnostic log.";
      return Response.json({ error: "Sign-up failed.", diagnosticId: id, diagnosticMessage: safeMessage }, { status: response.status, headers: { "Cache-Control": "no-store" } });
    }
    return response;
  } catch (error) {
    console.error("[auth-diagnostic] exception", { method: request.method, path, status: 500, error: errorDetails(error) });
    throw error;
  }
}

export async function GET(request: Request) {
  return withDiagnostics(betterAuthHandler.GET, request);
}

export async function POST(request: Request) {
  return withDiagnostics(betterAuthHandler.POST, request);
}
