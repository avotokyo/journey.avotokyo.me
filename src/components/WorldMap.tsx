/**
 * 地图 React 封装（Adapter 桥接层）。
 *
 * CircleMarker 标记 + token 配色，WorldMapController 管理生命周期。
 * 通过 forwardRef 暴露 showOverview()，供 Container 在回首页时命令式复位全景。
 */
import { theme } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

import { WorldMapController } from "../amap";
import type { Spot } from "../data";

/** 通过 ref 暴露给 Container 的地图命令接口 */
export type WorldMapHandle = {
  showOverview: () => void;
};

type WorldMapProps = {
  spots: Spot[];
  activeSpot?: Spot;
  onSelectSpot: (id: string) => void;
};

export const WorldMap = forwardRef<WorldMapHandle, WorldMapProps>(function WorldMap(
  { spots, activeSpot, onSelectSpot },
  ref,
) {
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

  useImperativeHandle(
    ref,
    () => ({
      showOverview: () => controllerRef.current?.showOverview(),
    }),
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = new WorldMapController();
    controllerRef.current = controller;
    let cancelled = false;

    void controller
      .init(container, spots, markerStyle, (spot) => onSelectSpot(spot.id))
      .then(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      controller.destroy();
      controllerRef.current = null;
      setReady(false);
    };
  }, [onSelectSpot, spots]);

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

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
});
