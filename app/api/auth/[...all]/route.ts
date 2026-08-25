import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const betterAuthHandler = toNextJsHandler(auth);

export const { GET, POST } = betterAuthHandler;
