"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createCdnPlugin } from "@/lib/challenges/esbuild-package-plugin";
import { useEsbuild } from "@/hooks/useEsbuild";

export interface LogMessage {
  type:
    | "LOG"
    | "ERROR"
    | "WARN"
    | "INFO"
    | "DEBUG"
    | "EXECUTION_ERROR"
    | "WORKER_ERROR"
    | "SYSTEM"
    | "VERIFICATION_ERROR";
  payload: any[];
  timestamp: Date;
}

export interface FetchDecision {
  decision: "PROCEED" | "MOCK_SUCCESS" | "MOCK_ERROR";
  responseData?: {
    body: any;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  };
  errorData?: {
    message: string;
  };
}

export interface InterceptedRpcCallOptions {
  method?: string;
  headers?: Record<string, string>;
}

export interface InterceptedRpcCallData {
  requestId: string;
  url: string;
  options: InterceptedRpcCallOptions;
  rpcMethod: string | null;
  body: any | null; // Parsed body
}

// New types for WebSocket Interception
export interface InterceptedWsSendData {
  wsRequestId: string; // Unique ID for this send request
  url: string; // WebSocket server URL
  data: any; // Data being sent (potentially serialized)
}

export interface WsSendDecision {
  decision: "PROCEED" | "BLOCK" | "MOCK_ERROR";
  errorMessage?: string; // For MOCK_ERROR
  /**
   * If provided, these messages will be dispatched as MessageEvents to the WebSocket instance
   * after the send (if PROCEED) or instead of the send (if BLOCK).
   */
  mockedReceives?: any[];
}

export interface InterceptedWsReceiveData {
  wsRequestId: string; // Unique ID for this receive event
  url: string; // WebSocket server URL
  data: any; // Data received from server (potentially serialized)
}

export interface WsReceiveDecision {
  decision: "PROCEED" | "BLOCK" | "MOCK_TO_CLIENT";
  mockedData?: any; // For MOCK_TO_CLIENT
}
// End of new WebSocket types

export interface UseEsbuildRunnerProps {
  onRpcCallInterceptedForDecision?: (
    rpcCallData: InterceptedRpcCallData,
  ) => Promise<FetchDecision>;
  onWsSendInterceptedForDecision?: ( // New prop for ws.send()
    wsSendData: InterceptedWsSendData,
  ) => Promise<WsSendDecision>;
  onWsReceiveInterceptedForDecision?: ( // New prop for messages from server
    wsReceiveData: InterceptedWsReceiveData,
  ) => Promise<WsReceiveDecision>;
}

export function useEsbuildRunner(props?: UseEsbuildRunnerProps) {
  const {
    esbuild,
    initState: esBuildInitializationState,
    initError: esbuildInitializationError,
  } = useEsbuild();

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [runnerError, setRunnerError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const addLog = useCallback((type: LogMessage["type"], ...payload: any[]) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      { type, payload, timestamp: new Date() },
    ]);
  }, []);

  useEffect(() => {
    if (esBuildInitializationState === "initializing") {
      addLog("SYSTEM", "Build system initialization in progress...");
    } else if (esBuildInitializationState === "failed") {
      addLog(
        "SYSTEM",
        `Build system initialization failed: ${esbuildInitializationError?.message}`,
      );
    }
  }, [esBuildInitializationState, esbuildInitializationError, addLog]);

  const runCode = useCallback(
    async (code: string) => {
      if (esBuildInitializationState === "uninitialized") {
        addLog(
          "SYSTEM",
          `Run attempt failed: Build system is not initialized. Please wait.`,
        );
      } else if (esBuildInitializationState === "initializing") {
        addLog(
          "SYSTEM",
          `Run attempt failed: Build system is still initializing. Please wait.`,
        );
      } else if (esBuildInitializationState === "failed") {
        addLog(
          "SYSTEM",
          `Run attempt failed: Build system initialization error: ${esbuildInitializationError?.message}`,
        );
      }

      if (isRunning) {
        addLog(
          "SYSTEM",
          "Run attempt failed: Another process is already running.",
        );
        return;
      }

      setIsRunning(true);
      setLogs([]);
      setRunnerError(null);
      addLog("SYSTEM", "Starting code execution...");

      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      try {
        const mainHandlingSuffix = `
;(async () => {
  // Ensure all synchronous code in the user's script has had a chance to run
  // and define 'main'. This yields to a new macrotask.
  await new Promise(resolve => setTimeout(resolve, 0));

  let __runner_error__ = null;
  try {
    if (typeof main === 'function') {
      // If main is async, 'await' will handle the promise.
      // If main is sync, it executes, and 'await' on its (non-Promise) result is harmless.
      // Any error thrown by main (sync or async) will be caught by this try-catch.
      await main();
    }
    // If main is not a function, or not defined, this block does nothing with it.
    // The user's other synchronous code (if any) would have already run.
  } catch (e) {
    __runner_error__ = e;
  } finally {
    if (__runner_error__) {
      let errorMessageForMainThread;
      if (__runner_error__ instanceof Error) {
        errorMessageForMainThread = __runner_error__.stack || __runner_error__.message;
      } else {
        errorMessageForMainThread = String(__runner_error__);
      }
      self.postMessage({ type: 'EXECUTION_ERROR', payload: errorMessageForMainThread });
    }
    // Always send EXECUTION_COMPLETE after main (if it exists) has been dealt with.
    self.postMessage({ type: 'EXECUTION_COMPLETE' });
  }
})();
`;

        const result = await esbuild.build({
          entryPoints: ["entry.ts"],
          plugins: [
            {
              name: "custom-entry",
              setup(build) {
                build.onResolve({ filter: /^entry\.ts$/ }, (args) => ({
                  path: args.path,
                  namespace: "custom-entry-ns",
                }));
                build.onLoad(
                  { filter: /.*/, namespace: "custom-entry-ns" },
                  () => ({
                    contents: code + "\n" + mainHandlingSuffix, // User code + main handling logic
                    loader: "ts",
                  }),
                );
              },
            },
            createCdnPlugin("@solana/web3.js", "cdn-solana-web3-ns"),
            createCdnPlugin("@solana/spl-token", "cdn-spl-token-ns"),
            createCdnPlugin("bs58", "cdn-bs58-ns"),
          ],
          bundle: true,
          format: "iife",
          platform: "browser",
          define: {
            "process.env.SECRET": JSON.stringify(
              process.env.NEXT_PUBLIC_CHALLENGE_SECRET,
            ),
            "process.env.RPC_ENDPOINT": JSON.stringify(
              process.env.NEXT_PUBLIC_MAINNET_RPC_ENDPOINT,
            ),
            window: "self",
          },
        });

        if (result.outputFiles && result.outputFiles.length > 0) {
          const bundledCode = result.outputFiles[0].text;
          const fetchPatcher = `
const rpcEndpointForWorker = "${process.env.NEXT_PUBLIC_MAINNET_RPC_ENDPOINT}";

if (!rpcEndpointForWorker) {
  throw new Error("RPC endpoint is not defined. Please set NEXT_PUBLIC_MAINNET_RPC_ENDPOINT environment variable.");
}

const originalFetch = self.fetch;

let fetchRequestIdCounter = 0;
const pendingFetches = new Map();

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  if (type === 'FETCH_DECISION_RESPONSE') {
    const { requestId, decision, responseData, errorData } = payload;
    const pending = pendingFetches.get(requestId);
    if (pending) {
      pendingFetches.delete(requestId);
      if (decision === 'PROCEED') {
        originalFetch.apply(self, pending.originalArgs)
          .then(pending.resolve)
          .catch(pending.reject);
      } else if (decision === 'MOCK_SUCCESS') {
        const mockedResponse = new Response(responseData.body ? JSON.stringify(responseData.body) : null, {
          status: responseData.status || 200,
          statusText: responseData.statusText || 'OK',
          headers: new Headers(responseData.headers || {}),
        });
        pending.resolve(mockedResponse);
      } else if (decision === 'MOCK_ERROR') {
        pending.reject(new Error(errorData?.message || 'Mocked fetch error'));
      } else {
        pending.reject(new Error('Unknown decision from main thread for fetch'));
      }
    }
  }
});

self.fetch = async function(...args) {
  const [url, options] = args;
  let rpcMethod = null;
  let requestBody = null; // Store the original body

  if (typeof url === 'string' && url === rpcEndpointForWorker) {
    if (options && options.body && typeof options.body === 'string') {
      try {
        requestBody = JSON.parse(options.body); // Store parsed body
        if (requestBody && requestBody.method) {
          rpcMethod = requestBody.method;
        }
      } catch (e) {
        // Could not parse request body
      }
    }

    const requestId = \`fetch-\${fetchRequestIdCounter++}\`;
    
    const serializableOptions = {
      method: options?.method,
      headers: {}
    };
    if (options && options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => { serializableOptions.headers[key] = value; });
      } else if (typeof options.headers === 'object' && !Array.isArray(options.headers)) {
        serializableOptions.headers = options.headers;
      }
    }
    
    self.postMessage({
      type: 'INTERCEPTED_RPC_CALL_AWAIT_DECISION',
      payload: {
        requestId,
        url: url,
        options: serializableOptions,
        rpcMethod: rpcMethod,
        body: requestBody 
      }
    });

    return new Promise((resolve, reject) => {
      pendingFetches.set(requestId, { resolve, reject, originalArgs: args });
    });
  }

  // For non-intercepted calls
  const promise = originalFetch.apply(self, args);
  return promise;
};
`;

          const webSocketPatcher = `

const OriginalWebSocket = self.WebSocket;
let wsRequestIdCounter = 0;
const pendingWsSendRequests = new Map();
const pendingWsReceiveRequests = new Map();

function dispatchMockedReceives(ws, mockedReceives) {
  if (!Array.isArray(mockedReceives)) return;
  mockedReceives.forEach(function(mockData) {
    var mockEvent = new MessageEvent('message', { data: mockData });
    if (typeof ws.onmessage === 'function') {
      ws.onmessage.call(ws, mockEvent);
    }
    ws.dispatchEvent(mockEvent);
  });
}

const WebSocketProxy = new Proxy(OriginalWebSocket, {
  construct(target, args) {
    const ws = new target(...args);

    // Intercept send
    ws.send = function(data) {
      const wsRequestId = 'ws-send-' + (wsRequestIdCounter++);
      return new Promise(function(resolve, reject) {
        pendingWsSendRequests.set(wsRequestId, { wsInstance: ws, originalSendData: data, resolve, reject });
        self.postMessage({
          type: 'INTERCEPTED_WS_SEND_AWAIT_DECISION',
          payload: { wsRequestId, url: ws.url, data }
        });
      });
    };

    // Intercept onmessage property
    let userOnMessage = null;
    Object.defineProperty(ws, 'onmessage', {
      set: function(func) { userOnMessage = func; },
      get: function() { return userOnMessage; }
    });

    // Intercept addEventListener for 'message'
    const origAddEventListener = ws.addEventListener;
    ws.addEventListener = function(type, listener, options) {
      if (type === 'message') {
        const wrappedListener = function(event) {
          const wsRequestId = 'ws-recv-' + (wsRequestIdCounter++);
          pendingWsReceiveRequests.set(wsRequestId, { originalEvent: event, wsInstancePatched: ws, listener });
          self.postMessage({
            type: 'INTERCEPTED_WS_RECEIVE_AWAIT_DECISION',
            payload: { wsRequestId, url: ws.url, data: event.data }
          });
        };
        origAddEventListener.call(ws, type, wrappedListener, options);
      } else {
        origAddEventListener.call(ws, type, listener, options);
      }
    };

    // Internal handler for native message events
    ws._internalMessageHandler = function(event) {
      const wsRequestId = 'ws-recv-' + (wsRequestIdCounter++);
      pendingWsReceiveRequests.set(wsRequestId, { originalEvent: event, wsInstancePatched: ws });
      self.postMessage({
        type: 'INTERCEPTED_WS_RECEIVE_AWAIT_DECISION',
        payload: { wsRequestId, url: ws.url, data: event.data }
      });
    };
    origAddEventListener.call(ws, 'message', ws._internalMessageHandler);

    return ws;
  }
});

self.addEventListener('message', function(event) {
  var type = event.data.type;
  var payload = event.data.payload;
  if (type === 'WS_SEND_DECISION_RESPONSE') {
    var requestId = payload.requestId;
    var decision = payload.decision;
    var errorMessage = payload.errorMessage;
    var mockedReceives = payload.mockedReceives;
    var pending = pendingWsSendRequests.get(requestId);
    if (pending) {
      pendingWsSendRequests.delete(requestId);
      if (decision === 'PROCEED') {
        try {
          OriginalWebSocket.prototype.send.call(pending.wsInstance, pending.originalSendData);
          dispatchMockedReceives(pending.wsInstance, mockedReceives);
          pending.resolve();
        } catch (e) {
          pending.reject(e);
        }
      } else if (decision === 'BLOCK') {
        dispatchMockedReceives(pending.wsInstance, mockedReceives);
        pending.resolve();
      } else if (decision === 'MOCK_ERROR') {
        pending.reject(new Error(errorMessage || 'WebSocket send mocked error'));
      }
    }
  } else if (type === 'WS_RECEIVE_DECISION_RESPONSE') {
    var requestId = payload.requestId;
    var decision = payload.decision;
    var mockedData = payload.mockedData;
    var pending = pendingWsReceiveRequests.get(requestId);
    if (pending) {
      pendingWsReceiveRequests.delete(requestId);
      var originalEvent = pending.originalEvent;
      var wsInstancePatched = pending.wsInstancePatched;
      var listener = pending.listener;
      // Prefer addEventListener handler if present, else onmessage
      if (decision === 'PROCEED') {
        if (listener) {
          listener.call(wsInstancePatched, originalEvent);
        } else if (wsInstancePatched.onmessage) {
          wsInstancePatched.onmessage.call(wsInstancePatched, originalEvent);
        }
      } else if (decision === 'MOCK_TO_CLIENT') {
        var mockEvent = new MessageEvent('message', { data: mockedData });
        if (listener) {
          listener.call(wsInstancePatched, mockEvent);
        } else if (wsInstancePatched.onmessage) {
          wsInstancePatched.onmessage.call(wsInstancePatched, mockEvent);
        }
      }
      // BLOCK: do nothing
    }
  }
});

self.WebSocket = WebSocketProxy;
`;

          const codeToExecuteInWorker = `\n${fetchPatcher}\n${webSocketPatcher}\n${bundledCode}\n`; // EXECUTION_COMPLETE logic is now bundled

          const workerInstance = new Worker(
            new URL("@/lib/challenges/runner.worker.ts", import.meta.url),
            { type: "module" },
          );
          workerRef.current = workerInstance;

          workerInstance.onmessage = (event) => {
            const message = event.data as { type: string; payload: any };
            switch (message.type) {
              case "LOG":
                addLog(
                  "LOG",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "ERROR":
                addLog(
                  "ERROR",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "WARN":
                addLog(
                  "WARN",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "INFO":
                addLog(
                  "INFO",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "DEBUG":
                addLog(
                  "DEBUG",
                  ...(Array.isArray(message.payload)
                    ? message.payload
                    : [message.payload]),
                );
                break;
              case "EXECUTION_ERROR":
                addLog("EXECUTION_ERROR", message.payload);
                setRunnerError(`Execution Error: ${message.payload}`);
                setIsRunning(false);
                if (workerRef.current) workerRef.current.terminate();
                break;
              case "WORKER_ERROR":
                addLog("WORKER_ERROR", message.payload);
                setRunnerError(`Worker Error: ${message.payload}`);
                setIsRunning(false);
                if (workerRef.current) workerRef.current.terminate();
                break;
              case "READY":
                workerInstance.postMessage(codeToExecuteInWorker);
                break;
              case "EXECUTION_COMPLETE":
                addLog("SYSTEM", "Execution complete.");
                setIsRunning(false);
                // Note: Worker termination is handled by main try-catch or useEffect cleanup
                break;
              case "INTERCEPTED_RPC_CALL_AWAIT_DECISION":
                const decisionPayload =
                  message.payload as InterceptedRpcCallData;

                if (props?.onRpcCallInterceptedForDecision) {
                  props
                    .onRpcCallInterceptedForDecision(decisionPayload)
                    .then((decision) => {
                      if (workerRef.current) {
                        // Ensure worker is still active
                        workerRef.current.postMessage({
                          type: "FETCH_DECISION_RESPONSE",
                          payload: {
                            requestId: decisionPayload.requestId,
                            ...decision,
                          },
                        });
                      }
                    })
                    .catch((err) => {
                      console.error(
                        "Error in onRpcCallInterceptedForDecision callback:",
                        err,
                      );
                      if (workerRef.current) {
                        // Ensure worker is still active
                        workerRef.current.postMessage({
                          // Default to PROCEED on error
                          type: "FETCH_DECISION_RESPONSE",
                          payload: {
                            requestId: decisionPayload.requestId,
                            decision: "PROCEED",
                          },
                        });
                      }
                    });
                } else {
                  // No callback provided, default to proceed
                  if (workerRef.current) {
                    // Ensure worker is still active
                    workerRef.current.postMessage({
                      type: "FETCH_DECISION_RESPONSE",
                      payload: {
                        requestId: decisionPayload.requestId,
                        decision: "PROCEED",
                      },
                    });
                  }
                }
                break;

                case "INTERCEPTED_WS_SEND_AWAIT_DECISION":
                const wsSendData = message.payload as InterceptedWsSendData;
                if (props?.onWsSendInterceptedForDecision) {
                  props.onWsSendInterceptedForDecision(wsSendData)
                    .then(decision => {
                      if (workerRef.current) { // Check if worker is still active
                        workerRef.current.postMessage({
                          type: "WS_SEND_DECISION_RESPONSE",
                          payload: { requestId: wsSendData.wsRequestId, ...decision },
                        });
                      }
                    })
                    .catch(err => {
                      console.error("Error in onWsSendInterceptedForDecision callback:", err);
                      if (workerRef.current) { // Default to PROCEED on error
                        workerRef.current.postMessage({
                          type: "WS_SEND_DECISION_RESPONSE",
                          payload: { requestId: wsSendData.wsRequestId, decision: "PROCEED" },
                        });
                      }
                    });
                } else { // No callback, default to PROCEED
                  if (workerRef.current) {
                    workerRef.current.postMessage({
                      type: "WS_SEND_DECISION_RESPONSE",
                      payload: { requestId: wsSendData.wsRequestId, decision: "PROCEED" },
                    });
                  }
                }
                break;
              case "INTERCEPTED_WS_RECEIVE_AWAIT_DECISION":
                const wsReceiveData = message.payload as InterceptedWsReceiveData;
                if (props?.onWsReceiveInterceptedForDecision) {
                  props.onWsReceiveInterceptedForDecision(wsReceiveData)
                    .then(decision => {
                      if (workerRef.current) { // Check if worker is still active
                        workerRef.current.postMessage({
                          type: "WS_RECEIVE_DECISION_RESPONSE",
                          payload: { requestId: wsReceiveData.wsRequestId, ...decision },
                        });
                      }
                    })
                    .catch(err => {
                      console.error("Error in onWsReceiveInterceptedForDecision callback:", err);
                      if (workerRef.current) { // Default to PROCEED on error
                        workerRef.current.postMessage({
                          type: "WS_RECEIVE_DECISION_RESPONSE",
                          payload: { requestId: wsReceiveData.wsRequestId, decision: "PROCEED" },
                        });
                      }
                    });
                } else { // No callback, default to PROCEED
                  if (workerRef.current) {
                    workerRef.current.postMessage({
                      type: "WS_RECEIVE_DECISION_RESPONSE",
                      payload: { requestId: wsReceiveData.wsRequestId, decision: "PROCEED" },
                    });
                  }
                }
                break;
              // End of new WebSocket message handlers
              default:
                addLog("SYSTEM", "Unknown message from worker:", message);
            }
          };

          workerInstance.onerror = (event) => {
            console.error("Worker uncaught error:", event);
            setRunnerError(
              `An error occurred in the Web Worker: ${event.message}`,
            );
            addLog("SYSTEM", `Worker uncaught error: ${event.message}`);
            setIsRunning(false);
            if (workerRef.current) {
              workerRef.current.terminate();
              workerRef.current = null;
            }
          };
        } else {
          setRunnerError("ESBuild did not produce any output files.");
          addLog("SYSTEM", "ESBuild failed to produce output.");
          setIsRunning(false);
        }
      } catch (e) {
        console.error("Error during build or run:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setRunnerError(`Build or Run Error: ${errorMessage}`);
        addLog("SYSTEM", `Build or Run Error: ${errorMessage}`);
        setIsRunning(false);
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    },
    [
      esBuildInitializationState,
      esbuildInitializationError,
      isRunning,
      addLog,
      props,
    ],
  );

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    esBuildInitializationState,
    esbuildInitializationError,
    isRunning,
    logs,
    error: runnerError,
    addLog,
    runCode,
    clearLogs: () => setLogs([]),
  };
}
