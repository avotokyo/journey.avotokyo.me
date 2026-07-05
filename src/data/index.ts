import type { Journey } from "./schema.ts";

const journeys = import.meta.glob<Journey>("./journeys/*.json", {
  eager: true,
  import: "default",
});

export function getAllJourneys(): Journey[] {
  return Object.values(journeys).sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function getJourneyById(id: string): Journey | undefined {
  return getAllJourneys().find((j) => j.id === id);
}
