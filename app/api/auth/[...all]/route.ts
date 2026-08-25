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
