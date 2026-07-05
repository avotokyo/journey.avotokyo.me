import type { SiteProfile, Spot } from "./schema.ts";
import site from "./site.json";
import spotsData from "./spots.json";

export function getSiteProfile(): SiteProfile {
  return site as SiteProfile;
}

export function getAllSpots(): Spot[] {
  return [...(spotsData as { spots: Spot[] }).spots].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.time ?? "").localeCompare(a.time ?? "");
  });
}

export function getSpotById(id: string): Spot | undefined {
  return getAllSpots().find((s) => s.id === id);
}
