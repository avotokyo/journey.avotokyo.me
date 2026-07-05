export interface Spot {
  id: string;
  name: string;
  address?: string;
  location: [number, number];
  date: string;
  time?: string;
  essay?: string;
  photos?: string[];
}

export function formatSpotDateTime(spot: Spot): string {
  return spot.time ? `${spot.date} ${spot.time}` : spot.date;
}

export function groupSpotsByDate(spots: Spot[]): Map<string, Spot[]> {
  const groups = new Map<string, Spot[]>();
  for (const spot of spots) {
    const list = groups.get(spot.date) ?? [];
    list.push(spot);
    groups.set(spot.date, list);
  }
  for (const [, list] of groups) {
    list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }
  return groups;
}

export function getAllSpots(spots: Spot[]): Spot[] {
  return [...spots].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.time ?? "").localeCompare(a.time ?? "");
  });
}

export function getSpotById(spots: Spot[], id: string): Spot | undefined {
  return spots.find((s) => s.id === id);
}
