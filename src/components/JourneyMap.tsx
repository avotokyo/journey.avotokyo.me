import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { Journey } from "../data/schema.ts";
import { MapController } from "../lib/amap/map-controller.ts";

export interface JourneyMapRef {
  focusWaypoint: (id: string) => void;
}

interface JourneyMapProps {
  journey: Journey;
}

const JourneyMap = forwardRef<JourneyMapRef, JourneyMapProps>(function JourneyMap(
  { journey },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<MapController | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = new MapController();
    controllerRef.current = controller;
    void controller.init(container, journey);

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [journey]);

  useImperativeHandle(ref, () => ({
    focusWaypoint(id: string) {
      const wp = journey.waypoints.find((w) => w.id === id);
      if (wp) controllerRef.current?.focusWaypoint(wp);
    },
  }));

  return <div ref={containerRef} className="world-map" />;
});

export default JourneyMap;
