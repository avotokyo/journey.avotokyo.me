import { useCallback, useState, useSyncExternalStore } from "react";

import { journeyRepository } from "../data/journeyRepository";
import { closeSpot, getSpotIdFromHash, openSpot, subscribeSpotId } from "../routing/hashSpotRouter";

/** 封装 Hash 驱动的景点选中态与地图全景复位 */
export function useJourneySelection() {
  const spotId = useSyncExternalStore(subscribeSpotId, getSpotIdFromHash);
  const activeSpot = spotId ? journeyRepository.getById(spotId) : undefined;
  const [overviewTick, setOverviewTick] = useState(0);

  const selectSpot = useCallback((id: string) => openSpot(id), []);
  const closeSelection = useCallback(() => closeSpot(), []);
  const goHome = useCallback(() => {
    if (spotId) closeSpot();
    setOverviewTick((t) => t + 1);
  }, [spotId]);

  return {
    spotId,
    activeSpot,
    overviewTick,
    selectSpot,
    closeSelection,
    goHome,
  };
}
