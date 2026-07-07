import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Spot } from "./data";

/**
 * URL 选中态 Hook（URL-as-State）。
 *
 * 从路由参数解析 activeSpot，提供 selectSpot / closeSelection 导航方法，
 * 并在 spotId 无效时重定向回首页。
 */
export function useJourneySelection(getById: (id: string) => Spot | undefined) {
  const { spotId } = useParams<{ spotId?: string }>();
  const navigate = useNavigate();
  const activeSpot = spotId ? getById(spotId) : undefined;

  useEffect(() => {
    if (spotId && !activeSpot) void navigate("/", { replace: true });
  }, [spotId, activeSpot, navigate]);

  const selectSpot = useCallback((id: string) => void navigate(`/spot/${id}`), [navigate]);
  const closeSelection = useCallback(() => void navigate("/"), [navigate]);

  return { spotId, activeSpot, selectSpot, closeSelection };
}
