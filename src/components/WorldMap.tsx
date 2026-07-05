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

/** 地图容器：挂载 AMap 实例，并根据路由同步视图 */
export default function WorldMap({ spots, activeSpot, onSpotClick }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [ready, setReady] = useState(false);

  // 初始化地图，组件卸载时销毁实例
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

  // 有选中景点则放大，否则回到中国全景
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
