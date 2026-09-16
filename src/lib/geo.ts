import type { GeoPoint } from "../types/domain";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two points in kilometres (Haversine formula). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

/** Rough road-distance estimate: straight-line distance with a detour factor,
 * since no live routing API is configured. Good enough for cost estimation. */
export function estimatedRoadDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const straight = distanceKm(a, b);
  const detourFactor = 1.3;
  return straight * detourFactor;
}

export function estimateTravelCost(
  a: GeoPoint,
  b: GeoPoint,
  ratePerKm: number,
): { distanceKm: number; cost: number } {
  const km = estimatedRoadDistanceKm(a, b);
  return { distanceKm: km, cost: Math.round(km * ratePerKm) };
}
