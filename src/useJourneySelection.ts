import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { Spot } from "./data";

/** 封装 URL 选中态：解析 activeSpot、导航与无效 ID 重定向 */
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
