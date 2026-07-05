import { GlobalOutlined, EnvironmentOutlined, AppstoreOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import { useEffect, useRef, useState } from "react";

import { WorldMapController } from "../amap.ts";
import type { Spot } from "../data/schema.ts";

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
    if (!ready) return;
    const controller = controllerRef.current;
    if (!controller) return;
    if (activeSpot) {
      controller.focusSpot(activeSpot);
    } else {
      controller.showOverview();
    }
  }, [ready, activeSpot]);

  const map = controllerRef.current;

  return (
    <>
      <div ref={containerRef} className="world-map" />
      {ready && map && (
        <div className="map-controls-affix">
          <FloatButton.Group shape="circle" className="map-float-buttons">
            <FloatButton
              icon={<GlobalOutlined />}
              tooltip="重置视图"
              onClick={() => map.resetView()}
            />
            <FloatButton
              icon={<AppstoreOutlined />}
              tooltip="切换地图样式"
              onClick={() => map.toggleMapStyle()}
            />
            <FloatButton
              icon={<EnvironmentOutlined />}
              tooltip="适应全部标记"
              onClick={() => map.fitAll()}
            />
          </FloatButton.Group>
        </div>
      )}
    </>
  );
}
