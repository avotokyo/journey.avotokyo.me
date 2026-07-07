/**
 * 地图 React 封装：CircleMarker 标记 + token 配色，WorldMapController 管理生命周期。
 */
import { theme } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";

import { WorldMapController } from "../amap";
import { spots, type Spot } from "../data/spots";

export function WorldMap({
  activeSpot,
  overviewTick,
  onSpotClick,
}: {
  activeSpot?: Spot;
  overviewTick: number;
  onSpotClick: (spot: Spot) => void;
}) {
  const { token } = theme.useToken();
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<WorldMapController | null>(null);
  const [ready, setReady] = useState(false);

  const markerStyle = useMemo(
    () => ({
      fillColor: token.colorPrimary,
      activeFillColor: token.colorPrimaryActive,
      strokeColor: token.colorBgContainer,
    }),
    [token.colorPrimary, token.colorPrimaryActive, token.colorBgContainer],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = new WorldMapController();
    controllerRef.current = controller;
    let cancelled = false;

    void controller.init(container, spots, markerStyle, onSpotClick).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      controller.destroy();
      controllerRef.current = null;
      setReady(false);
    };
  }, [onSpotClick]);

  useEffect(() => {
    if (!ready) return;
    controllerRef.current?.updateMarkerStyle(markerStyle);
  }, [ready, markerStyle]);

  useEffect(() => {
    if (!ready) return;
    controllerRef.current?.setActiveSpot(activeSpot?.id ?? null);
    if (!activeSpot) return;
    controllerRef.current?.focusSpot(activeSpot);
  }, [ready, activeSpot]);

  useEffect(() => {
    if (!ready || overviewTick === 0) return;
    controllerRef.current?.showOverview();
  }, [ready, overviewTick]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}
