import { createMiddleware } from "@tanstack/react-start";

/**
 * Middleware to attach Supabase authentication to the request context
 * This middleware ensures that auth state is available throughout the request lifecycle
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    // Auth context will be attached here
    // For now, we pass through to the next middleware
    return await next();
  },
);
