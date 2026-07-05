import AMapLoader from "@amap/amap-jsapi-loader";

let amapPromise: Promise<typeof AMap> | null = null;

export function loadAMap(): Promise<typeof AMap> {
  if (!amapPromise) {
    const key = import.meta.env.VITE_AMAP_KEY;
    if (!key) {
      return Promise.reject(new Error("VITE_AMAP_KEY is not configured"));
    }
    amapPromise = AMapLoader.load({
      key,
      version: "2.0",
      plugins: ["AMap.InfoWindow"],
    });
  }
  return amapPromise;
}
