import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { journeyRepository } from "../data/journeyRepository";

/** 封装 react-router 驱动的景点选中态与地图全景复位 */
export function useJourneySelection() {
  const { spotId } = useParams<{ spotId?: string }>();
  const navigate = useNavigate();
  const activeSpot = spotId ? journeyRepository.getById(spotId) : undefined;
  const [overviewTick, setOverviewTick] = useState(0);

  const selectSpot = useCallback((id: string) => void navigate(`/spot/${id}`), [navigate]);
  const closeSelection = useCallback(() => void navigate("/"), [navigate]);
  const goHome = useCallback(() => {
    if (spotId) void navigate("/");
    setOverviewTick((t) => t + 1);
  }, [spotId, navigate]);

  return { spotId, activeSpot, overviewTick, selectSpot, closeSelection, goHome };
}
