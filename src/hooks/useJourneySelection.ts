import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/** 封装 react-router 导航与地图全景复位 tick（不含数据解析） */
export function useJourneySelection() {
  const { spotId } = useParams<{ spotId?: string }>();
  const navigate = useNavigate();
  const [overviewTick, setOverviewTick] = useState(0);

  const selectSpot = useCallback((id: string) => void navigate(`/spot/${id}`), [navigate]);
  const closeSelection = useCallback(() => void navigate("/"), [navigate]);
  const goHome = useCallback(() => {
    if (spotId) void navigate("/");
    setOverviewTick((t) => t + 1);
  }, [spotId, navigate]);

  return { spotId, overviewTick, selectSpot, closeSelection, goHome };
}
