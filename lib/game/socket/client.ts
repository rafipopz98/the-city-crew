"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { ServerEvents, MatchSocketEvent, MatchSocketResult } from "./types";

let defaultSocketUrl = "http://localhost:3001";
if (typeof window !== "undefined") {
  const host = window.location.hostname;
  defaultSocketUrl = `http://${host}:3001`;
}
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || defaultSocketUrl;

type ServerEventCallback = {
  [K in keyof ServerEvents]: (data: Parameters<ServerEvents[K]>[0]) => void;
};

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<Partial<ServerEventCallback>>({});
  const registeredEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🎮 Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🎮 Socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("🎮 Socket connection error:", err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  // Dynamically register/unregister event listeners
  const registerListeners = useCallback((listeners: Partial<ServerEventCallback>) => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove old listeners
    for (const event of registeredEventsRef.current) {
      socket.off(event);
    }
    registeredEventsRef.current.clear();

    // Register new listeners
    for (const [event, handler] of Object.entries(listeners)) {
      if (handler && typeof handler === "function") {
        socket.on(event, handler as (...args: any[]) => void);
        registeredEventsRef.current.add(event);
      }
    }

    listenersRef.current = listeners;
  }, []);

  const emit = useCallback(
    (event: string, ...args: any[]) => {
      socketRef.current?.emit(event, ...args);
    },
    [],
  );

  const joinQueue = useCallback(
    (data: { userId: string; squadRating: number; username: string; squadPlayers?: string[] }) => {
      return new Promise<{ success: boolean; message?: string }>((resolve) => {
        socketRef.current?.emit("matchmaking:join", data, (response: any) => {
          resolve(response);
        });
      });
    },
    [],
  );

  const leaveQueue = useCallback(() => {
    socketRef.current?.emit("matchmaking:leave");
  }, []);

  return {
    socket: socketRef.current,
    connected,
    emit,
    registerListeners,
    joinQueue,
    leaveQueue,
  };
}
