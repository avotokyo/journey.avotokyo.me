import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const JOURNEYS_DIR = join(ROOT, "src/data/journeys");

function loadDotEnv(): void {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

interface Waypoint {
  id: string;
  location: [number, number];
}

interface Segment {
  from: string;
  to: string;
  mode: "walking" | "driving" | "transit";
  polyline?: [number, number][];
  distance?: number;
  duration?: number;
}

interface Journey {
  id: string;
  waypoints: Waypoint[];
  segments: Segment[];
}

const AMAP_KEY = process.env.AMAP_WEB_SERVICE_KEY;
const BASE_URL = "https://restapi.amap.com";

async function fetchDirection(
  origin: [number, number],
  destination: [number, number],
  mode: Segment["mode"],
): Promise<{ polyline: [number, number][]; distance: number; duration: number } | null> {
  const endpoints: Record<Segment["mode"], string> = {
    walking: "/v3/direction/walking",
    driving: "/v3/direction/driving",
    transit: "/v3/direction/transit/integrated",
  };

  const params = new URLSearchParams({
    key: AMAP_KEY ?? "",
    origin: `${origin[0]},${origin[1]}`,
    destination: `${destination[0]},${destination[1]}`,
  });
  if (mode === "transit") {
    params.set("city", "北京");
    params.set("cityd", "北京");
  }

  const res = await fetch(`${BASE_URL}${endpoints[mode]}?${params}`);
  const data = await res.json();

  if (data.status !== "1") {
    console.warn(`  Direction API failed: ${data.info}`);
    return null;
  }

  function decodePolyline(encoded: string): [number, number][] {
    return encoded.split(";").map((p: string) => {
      const [lng, lat] = p.split(",").map(Number);
      return [lng, lat] as [number, number];
    });
  }

  function mergeSteps(steps: Array<{ polyline: string }>): [number, number][] {
    const pts: [number, number][] = [];
    for (const s of steps) pts.push(...decodePolyline(s.polyline));
    return pts;
  }

  if (mode === "transit") {
    const transit = data.route?.transits?.[0];
    if (!transit) return null;
    const points: [number, number][] = [];
    for (const seg of transit.segments ?? []) {
      if (seg.walking?.steps) points.push(...mergeSteps(seg.walking.steps));
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
    polyline: mergeSteps(path.steps),
    distance: Number(path.distance),
    duration: Number(path.duration),
  };
}

function getWaypoint(journey: Journey, id: string): Waypoint | undefined {
  return journey.waypoints.find((wp) => wp.id === id);
}

async function resolveJourney(filePath: string): Promise<void> {
  const content = readFileSync(filePath, "utf-8");
  const journey = JSON.parse(content) as Journey;
  let updated = false;

  console.log(`Processing: ${journey.id}`);

  for (const seg of journey.segments) {
    if (seg.polyline?.length) {
      console.log(`  Skipping ${seg.from} → ${seg.to} (already resolved)`);
      continue;
    }

    const from = getWaypoint(journey, seg.from);
    const to = getWaypoint(journey, seg.to);
    if (!from || !to) {
      console.warn(`  Missing waypoint for segment ${seg.from} → ${seg.to}`);
      continue;
    }

    console.log(`  Resolving ${seg.from} → ${seg.to} (${seg.mode})...`);
    const result = await fetchDirection(from.location, to.location, seg.mode);
    if (result) {
      seg.polyline = result.polyline;
      seg.distance = result.distance;
      seg.duration = result.duration;
      updated = true;
      console.log(
        `    ✓ ${result.distance}m, ${result.duration}s, ${result.polyline.length} points`,
      );
    }
  }

  if (updated) {
    writeFileSync(filePath, JSON.stringify(journey, null, 2) + "\n");
    console.log(`  Saved: ${filePath}`);
  }
}

async function main(): Promise<void> {
  if (!AMAP_KEY) {
    console.warn("AMAP_WEB_SERVICE_KEY not set, skipping route resolution");
    return;
  }

  const files = readdirSync(JOURNEYS_DIR).filter((f: string) => f.endsWith(".json"));
  for (const file of files) {
    await resolveJourney(join(JOURNEYS_DIR, file));
  }
  console.log("Done.");
}

main().catch(console.error);
