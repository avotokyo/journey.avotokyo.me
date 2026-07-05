import type { Journey, MapPoint, Place, SiteProfile } from "./schema.ts";
import site from "./site.json";
import placesData from "./places.json";

const journeys = import.meta.glob<Journey>("./journeys/*.json", {
  eager: true,
  import: "default",
});

export function getSiteProfile(): SiteProfile {
  return site as SiteProfile;
}

export function getStandalonePlaces(): Place[] {
  return (placesData as { places: Place[] }).places;
}

export function getAllJourneys(): Journey[] {
  return Object.values(journeys).sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getJourneyById(id: string): Journey | undefined {
  return getAllJourneys().find((j) => j.id === id);
}

export function getAllMapPoints(): MapPoint[] {
  const points: MapPoint[] = [];

  for (const place of getStandalonePlaces()) {
    points.push({
      id: place.id,
      name: place.name,
      location: place.location,
      category: place.category,
      notes: place.notes,
    });
  }

  for (const journey of getAllJourneys()) {
    for (const wp of journey.waypoints) {
      points.push({
        id: `${journey.id}-${wp.id}`,
        name: wp.name,
        location: wp.location,
        category: wp.category ?? "visited",
        notes: wp.notes,
        journeyId: journey.id,
        journeyTitle: journey.title,
      });
    }
  }

  return points;
}

export function getMapPointsForJourney(journeyId: string): MapPoint[] {
  return getAllMapPoints().filter((p) => p.journeyId === journeyId || !p.journeyId);
}
