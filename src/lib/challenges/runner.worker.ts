// The worker forwards arbitrary console arguments and runtime errors back to the main thread.
interface ConsoleMessage {
  type: "LOG" | "ERROR" | "INFO" | "EXECUTION_ERROR" | "WORKER_ERROR" | "READY";
  payload: any;
}

// Store original console methods at the top level of the worker scope
const originalConsoleLog = self.console.log;
const originalConsoleError = self.console.error;
const originalConsoleInfo = self.console.info;

// Override console methods to post messages to the main thread
self.console.log = (...args: any[]) => {
  self.postMessage({ type: "LOG", payload: args } as ConsoleMessage);
  originalConsoleLog.apply(self.console, args); // Also log in worker's own console
};
self.console.error = (...args: any[]) => {
  self.postMessage({ type: "ERROR", payload: args } as ConsoleMessage);
  originalConsoleError.apply(self.console, args);
};
self.console.info = (...args: any[]) => {
  self.postMessage({ type: "INFO", payload: args } as ConsoleMessage);
  originalConsoleInfo.apply(self.console, args);
};

let codeLoaded = false;

self.onmessage = (event: MessageEvent<string>) => {
  const code = event.data;

  try {
    if (!codeLoaded) {
      codeLoaded = true;

      // Execute the bundled code.
      // 'self' is passed to make the worker's global scope available to the code.
      new Function("self", code)(self);
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({
      type: "EXECUTION_ERROR",
      payload: errorMessage,
    } as ConsoleMessage);
    originalConsoleError("Error executing code in worker:", e); // Log to worker's console
  }
};

self.onerror = (event: Event | string) => {
  // This handles unhandled errors within the worker script itself or uncatchable errors from new Function
  let message = "Unknown worker error";
  if (typeof event === "string") {
    message = event;
  } else if (event instanceof ErrorEvent) {
    message = event.message;
  }

  self.postMessage({
    type: "WORKER_ERROR",
    payload: message,
  } as ConsoleMessage);
  originalConsoleError("Unhandled error in worker:", event);

  if (event instanceof Event) {
    event.preventDefault(); // Prevents the default browser error handling for the worker if it's an Event
  }
};

// Signal that the worker is ready
self.postMessage({
  type: "READY",
  payload: "Worker initialized",
} as ConsoleMessage);
