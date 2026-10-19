// Global error capture for server-side rendering
let lastCapturedError: Error | undefined;

// Capture global errors during SSR
if (typeof globalThis !== 'undefined') {
  const originalConsoleError = console.error;
  
  console.error = function(...args: any[]) {
    // Capture the first error-like argument
    for (const arg of args) {
      if (arg instanceof Error) {
        lastCapturedError = arg;
        break;
      }
    }
    // Call original console.error
    originalConsoleError.apply(console, args);
  };
}

export function consumeLastCapturedError(): Error | undefined {
  const error = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

export function captureError(error: Error): void {
  lastCapturedError = error;
}
