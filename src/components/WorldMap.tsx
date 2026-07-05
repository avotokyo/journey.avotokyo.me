import { useEffect, useRef, useState } from "react";
import type { PlaceCategory, Spot } from "../data/schema.ts";
import { WorldMapController } from "../lib/amap/world-map-controller.ts";
import MapLegend from "./MapLegend.tsx";
import MapControls from "./MapControls.tsx";

const ALL_CATEGORIES: PlaceCategory[] = ["visited", "stay", "residence", "airport", "wishlist"];

interface WorldMapProps {
  spots: Spot[];
  onSpotClick?: (spot: Spot) => void;
}

export default function WorldMap({ spots, onSpotClick }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<PlaceCategory>>(
    () => new Set(ALL_CATEGORIES),
  );
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
    controllerRef.current?.setCategoryFilter(activeCategories);
  }, [activeCategories, ready]);

  const map = controllerRef.current;

  return (
    <>
      <div ref={containerRef} className="world-map" />
      {ready && map && (
        <>
          <div className="map-legend-affix">
            <MapLegend activeCategories={activeCategories} onChange={setActiveCategories} />
          </div>
          <div className="map-controls-affix">
            <MapControls
              onReset={() => map.resetView()}
              onToggleStyle={() => map.toggleMapStyle()}
              onFitAll={() => map.fitAll()}
            />
          </div>
        </>
      )}
    </>
  );
}
