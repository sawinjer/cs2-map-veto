import { useEffect, useRef, useState } from "react";

export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface UseWebSocketOptions {
  pingInterval?: number;
  maxMissedPings?: number;
  reconnectDelay?: number;
}

type EdenChannel<T> = {
  on(type: "open", listener: (event: Event) => void): unknown;
  on(type: "message", listener: (event: { data: T }) => void): unknown;
  on(type: "close", listener: (event: CloseEvent) => void): unknown;
  send(data: string): unknown;
  close(): unknown;
  ws: WebSocket;
};

const PING = JSON.stringify({ type: "ping" });

export function useWebSocket<T>(
  createChannel: () => EdenChannel<T>,
  options: UseWebSocketOptions = {},
) {
  const {
    pingInterval = 5000,
    maxMissedPings = 3,
    reconnectDelay = 2000,
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [status, setStatus] = useState<WebSocketStatus>("disconnected");

  const optionsRef = useRef({ pingInterval, maxMissedPings, reconnectDelay });
  optionsRef.current = { pingInterval, maxMissedPings, reconnectDelay };

  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    let channel: EdenChannel<T> | null = null;
    let missedPings = 0;

    const stopPing = () => {
      if (pingIntervalRef.current !== null) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };

    const abortReconnect = () => {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    const connect = () => {
      if (!active) return;

      stopPing();
      abortReconnect();

      missedPings = 0;
      setStatus("connecting");

      channel = createChannel();

      channel.on("open", () => {
        if (!active) {
          channel?.close();
          return;
        }
        missedPings = 0;
        setStatus("connected");

        pingIntervalRef.current = setInterval(() => {
          if (channel?.ws.readyState !== WebSocket.OPEN) return;

          if (missedPings >= optionsRef.current.maxMissedPings) {
            stopPing();
            setStatus("reconnecting");
            channel?.close();
            return;
          }

          channel.send(PING);
          missedPings += 1;
        }, optionsRef.current.pingInterval);
      });

      channel.on("message", (event) => {
        if (!active) return;

        if (event.data === "pong") {
          missedPings = 0;
          return;
        }
        setData(event.data);
      });

      channel.on("close", () => {
        stopPing();
        if (!active) {
          setStatus("disconnected");
          return;
        }
        reconnectTimeoutRef.current = setTimeout(
          connect,
          optionsRef.current.reconnectDelay,
        );
      });
    };

    connect();

    return () => {
      active = false;
      stopPing();
      abortReconnect();
      channel?.close();
    };
  }, [createChannel]);

  return { data, status };
}
