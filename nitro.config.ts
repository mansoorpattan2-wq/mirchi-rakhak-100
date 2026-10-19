import type { NitroConfig } from "nitro/types";

export default {
  // Keep Admin's CommonJS/ESM entry points intact. Bundling them together breaks SDK_VERSION.
  // Nitro traces these runtime dependencies into the standalone Node deployment artifact.
  traceDeps: ["firebase-admin"],
  vercel: {
    functions: { runtime: "nodejs24.x", maxDuration: 120 },
  },
} satisfies NitroConfig;
