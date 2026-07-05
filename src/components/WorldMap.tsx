import { useEffect, useRef, useState } from "react";
import type { Spot } from "../data/schema.ts";
import { WorldMapController } from "../lib/amap/world-map-controller.ts";
import MapControls from "./MapControls.tsx";

interface WorldMapProps {
  spots: Spot[];
  activeSpot?: Spot;
  onSpotClick?: (spot: Spot) => void;
}

export default function WorldMap({ spots, activeSpot, onSpotClick }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = new WorldMapController();
    controllerRef.current = controller;
    let cancelled = false;

    void controller
      .init(container, spots, {
        onSpotClick: (spot) => onSpotClick?.(spot),
      })
      .then(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      controller.destroy();
      controllerRef.current = null;
      setReady(false);
    };
  }, [spots, onSpotClick]);

  useEffect(() => {
    if (!ready || !activeSpot) return;
    controllerRef.current?.focusSpot(activeSpot);
  }, [ready, activeSpot]);

  const map = controllerRef.current;

  return (
    <>
      <div ref={containerRef} className="world-map" />
      {ready && map && (
        <div className="map-controls-affix">
          <MapControls
            onReset={() => map.resetView()}
            onToggleStyle={() => map.toggleMapStyle()}
            onFitAll={() => map.fitAll()}
          />
        </div>
      )}
    </>
  );
}
