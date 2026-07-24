import { useCallback, useEffect, useRef, useState } from "react";
import { DEMO_SCRIPT, type DemoEvent } from "../lib/demoScript";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function postVisionEvent(event: DemoEvent): Promise<void> {
  await fetch(`${API_URL}/api/vision/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Vision-Key": "dev-vision-key",
    },
    body: JSON.stringify({
      source: "demo",
      detections: event.detections,
    }),
  });
}

/**
 * Reproduce DEMO_SCRIPT contra /api/vision/report mientras `playing` es true.
 * El timer avanza 1s por tick; cada evento se dispara una sola vez al cruzar su `time`.
 */
export function useDemoPlayback(playing: boolean): {
  currentTime: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isPlaying: boolean;
} {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(playing);
  const [epoch, setEpoch] = useState(0);
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    setIsPlaying(playing);
  }, [playing]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentTime((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    DEMO_SCRIPT.forEach((event, index) => {
      if (currentTime < event.time || firedRef.current.has(index)) return;
      firedRef.current.add(index);
      void postVisionEvent(event);
    });
  }, [currentTime, epoch, isPlaying]);

  const start = useCallback(() => setIsPlaying(true), []);
  const stop = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => {
    firedRef.current = new Set();
    setCurrentTime(0);
    setEpoch((n) => n + 1);
  }, []);

  return { currentTime, start, stop, reset, isPlaying };
}
