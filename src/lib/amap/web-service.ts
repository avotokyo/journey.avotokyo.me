import type { TransportMode } from "../../data/schema.ts";

interface AmapResponse {
  status: string;
  info: string;
  geocodes?: Array<{ location: string }>;
  regeocode?: { formatted_address: string };
  pois?: Array<{
    id: string;
    name: string;
    address: string;
    location: string;
    type: string;
  }>;
  route?: {
    paths?: Array<{
      distance: string;
      duration: string;
      steps?: Array<{ polyline: string }>;
    }>;
    transits?: Array<{
      distance: string;
      duration: string;
      segments?: Array<{
        walking?: { steps?: Array<{ polyline: string }> };
        bus?: { buslines?: Array<{ polyline: string }> };
      }>;
    }>;
  };
}

async function amapFetch<T extends AmapResponse>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const search = new URLSearchParams(params);
  const url = `/api/amap${path}?${search.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Amap API error: ${res.status}`);
  const data = (await res.json()) as T;
  if (data.status !== "1") throw new Error(data.info || "Amap API request failed");
  return data;
}

export interface GeocodeResult {
  location: [number, number];
}

export async function geocode(address: string, city?: string): Promise<GeocodeResult | null> {
  const data = await amapFetch("/v3/geocode/geo", {
    address,
    ...(city ? { city } : {}),
  });
  const loc = data.geocodes?.[0]?.location;
  if (!loc) return null;
  const [lng, lat] = loc.split(",").map(Number);
  return { location: [lng, lat] };
}

export async function regeocode(lng: number, lat: number): Promise<string | null> {
  const data = await amapFetch("/v3/geocode/regeo", {
    location: `${lng},${lat}`,
  });
  return data.regeocode?.formatted_address ?? null;
}

export interface POIResult {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  type: string;
}

export async function searchPOI(keyword: string, city = "北京"): Promise<POIResult[]> {
  const data = await amapFetch("/v3/place/text", {
    keywords: keyword,
    city,
    offset: "10",
    page: "1",
  });
  return (data.pois ?? []).map((poi) => {
    const [lng, lat] = poi.location.split(",").map(Number);
    return {
      id: poi.id,
      name: poi.name,
      address: poi.address,
      location: [lng, lat],
      type: poi.type,
    };
  });
}

export interface DirectionResult {
  polyline: [number, number][];
  distance: number;
  duration: number;
}

function decodePolyline(encoded: string): [number, number][] {
  return encoded.split(";").map((point) => {
    const [lng, lat] = point.split(",").map(Number);
    return [lng, lat] as [number, number];
  });
}

function mergePolylines(steps: Array<{ polyline: string }>): [number, number][] {
  const points: [number, number][] = [];
  for (const step of steps) {
    points.push(...decodePolyline(step.polyline));
  }
  return points;
}

const modeEndpoints: Record<TransportMode, string> = {
  walking: "/v3/direction/walking",
  driving: "/v3/direction/driving",
  transit: "/v3/direction/transit/integrated",
};

export async function direction(
  origin: [number, number],
  destination: [number, number],
  mode: TransportMode,
  city = "北京",
): Promise<DirectionResult | null> {
  const originStr = `${origin[0]},${origin[1]}`;
  const destStr = `${destination[0]},${destination[1]}`;

  const params: Record<string, string> = {
    origin: originStr,
    destination: destStr,
  };
  if (mode === "transit") {
    params.city = city;
    params.cityd = city;
  }

  const data = await amapFetch(modeEndpoints[mode], params);

  if (mode === "transit") {
    const transit = data.route?.transits?.[0];
    if (!transit) return null;
    const points: [number, number][] = [];
    for (const seg of transit.segments ?? []) {
      if (seg.walking?.steps) points.push(...mergePolylines(seg.walking.steps));
      for (const line of seg.bus?.buslines ?? []) {
        if (line.polyline) points.push(...decodePolyline(line.polyline));
      }
    }
    return {
      polyline: points,
      distance: Number(transit.distance),
      duration: Number(transit.duration),
    };
  }

  const path = data.route?.paths?.[0];
  if (!path?.steps) return null;
  return {
    polyline: mergePolylines(path.steps),
    distance: Number(path.distance),
    duration: Number(path.duration),
  };
}

export function staticMapUrl(
  center: [number, number],
  markers: Array<{ location: [number, number]; label?: string }>,
  size = "800*400",
): string {
  const markerStr = markers
    .map((m, i) => {
      const label = m.label ?? String.fromCharCode(65 + i);
      return `mid,0xFF5722,${label}:${m.location[0]},${m.location[1]}`;
    })
    .join("|");

  const params = new URLSearchParams({
    location: `${center[0]},${center[1]}`,
    zoom: "12",
    size,
    markers: markerStr,
  });

  return `/api/amap/v3/staticmap?${params.toString()}`;
}
