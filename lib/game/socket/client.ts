"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ServerMessage, ClientMessage } from "./protocol";

function getWsUrl(): string {
  const host = window.location.host;

  // Local dev with `next dev`: WebSocket upgrades don't work on the Next.js
  // port, so connect to the dev WebSocket server on port 3001 instead.
  if (
    host.startsWith("localhost:") ||
    host === "localhost" ||
    host.startsWith("127.0.0.1")
  ) {
    return "ws://localhost:3001";
  }

  // Production / Vercel: WebSocket upgrades work via /api/ws
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${host}/api/ws`;
}

type MessageHandler = (message: ServerMessage) => void;

export function useSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const handlersRef = useRef<Set<MessageHandler>>(new Set());
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000);
  const cancelledRef = useRef(false);
  const joinQueueResolveRef = useRef<((value: { success: boolean; message?: string }) => void) | null>(null);

  const connect = useCallback(() => {
    if (cancelledRef.current || wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = getWsUrl();
    console.log(`[PvP] Connecting to WebSocket at ${url}...`);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      // Only mark connected if this WebSocket is still the current one
      if (wsRef.current !== ws) {
        console.log("[PvP] ⏭ Ignoring stale onopen from old WebSocket");
        return;
      }
      console.log("[PvP] ✅ WebSocket connected!");
      setConnected(true);
      reconnectDelayRef.current = 1000;
    };

    ws.onmessage = (event: MessageEvent) => {
      let message: ServerMessage;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      // Handle ACK messages (resolve the joinQueue promise)
      if (message.type === "match:ack") {
        console.log("[PvP] 📩 Received match:ack:", message.payload);
        if (joinQueueResolveRef.current) {
          joinQueueResolveRef.current(message.payload);
          joinQueueResolveRef.current = null;
        }
        return;
      }

      // Log all server messages
      console.log(`[PvP] 📩 Server message: ${message.type}`, message.payload);

      // Forward to registered handlers
      for (const handler of handlersRef.current) {
        try {
          handler(message);
        } catch (err) {
          console.error("[ws] handler error:", err);
        }
      }
    };

    ws.onclose = () => {
      console.log("[PvP] ❌ WebSocket disconnected");
      setConnected(false);
      wsRef.current = null;

      // Reconnect with exponential backoff
      if (!cancelledRef.current) {
        const delay = reconnectDelayRef.current;
        console.log(`[PvP] Reconnecting in ${delay}ms...`);
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
      }
    };

    ws.onerror = (err) => {
      console.error("[PvP] WebSocket error:", err);
      // onclose will fire after this, so reconnection is handled there
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    connect();

    return () => {
      cancelledRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const registerListeners = useCallback((handler: MessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  }, []);

  /**
   * Send a message to the server, optionally waiting for an ACK response.
   */
  const sendMessage = useCallback((message: ClientMessage): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  /**
   * Join the matchmaking queue. Returns a promise that resolves with the
   * server's ACK response.
   */
  const joinQueue = useCallback(
    (data: {
      userId: string;
      squadRating: number;
      username: string;
      squadPlayers?: string[];
      squadPlayerPositions?: string[];
    }): Promise<{ success: boolean; message?: string }> => {
      console.log("[PvP] Sending matchmaking:join", { userId: data.userId, rating: data.squadRating, username: data.username });
      return new Promise((resolve, reject) => {
        joinQueueResolveRef.current = resolve;

        const message: ClientMessage = {
          type: "matchmaking:join",
          payload: data,
          id: crypto.randomUUID(),
        };

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          console.log("[PvP] WebSocket OPEN, sending join message...");
          wsRef.current.send(JSON.stringify(message));
        } else {
          console.warn("[PvP] WebSocket NOT open, rejecting");
          joinQueueResolveRef.current = null;
          reject(new Error("WebSocket not connected"));
          return;
        }

        // Timeout after 10 seconds if no ACK
        setTimeout(() => {
          if (joinQueueResolveRef.current) {
            console.warn("[PvP] ⏱️ Join queue timed out after 10s");
            joinQueueResolveRef.current = null;
            reject(new Error("Join queue request timed out"));
          }
        }, 10000);
      });
    },
    [],
  );

  const leaveQueue = useCallback(() => {
    console.log("[PvP] Leaving queue");
    const message: ClientMessage = {
      type: "matchmaking:leave",
    };
    wsRef.current?.send(JSON.stringify(message));
  }, []);

  return {
    connected,
    sendMessage,
    registerListeners,
    joinQueue,
    leaveQueue,
  };
}
