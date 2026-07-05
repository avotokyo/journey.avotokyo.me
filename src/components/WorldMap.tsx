import { useEffect, useRef, useState } from "react";
import type { MapPoint, PlaceCategory } from "../data/schema.ts";
import { WorldMapController } from "../lib/amap/world-map-controller.ts";
import MapLegend from "./MapLegend.tsx";
import MapControls from "./MapControls.tsx";

const ALL_CATEGORIES: PlaceCategory[] = ["visited", "stay", "residence", "airport", "wishlist"];

interface WorldMapProps {
  points: MapPoint[];
  zoom?: number;
  center?: [number, number];
}

export default function WorldMap({ points, zoom, center }: WorldMapProps) {
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

    void controller.init(container, points, { zoom, center }).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      controller.destroy();
      controllerRef.current = null;
      setReady(false);
    };
  }, [points, zoom, center]);

  useEffect(() => {
    controllerRef.current?.setCategoryFilter(activeCategories);
  }, [activeCategories, ready]);

  const toggleCategory = (category: PlaceCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const map = controllerRef.current;

  return (
    <>
      <div ref={containerRef} className="world-map" />
      {ready && map && (
        <>
          <div className="map-overlay map-overlay-legend">
            <MapLegend activeCategories={activeCategories} onToggle={toggleCategory} />
          </div>
          <div className="map-overlay map-overlay-controls">
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
