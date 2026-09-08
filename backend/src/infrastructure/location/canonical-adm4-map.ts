import type { Coordinates } from './location.types.js';

type CanonicalPoint = Coordinates & { adm4: string };

// Curated and explicitly verified examples from the AI/Data BMKG dictionary.
const points: CanonicalPoint[] = [
  { lat: -7.927, lon: 112.613, adm4: '35.73.05.1001' },
];

const distanceKm = (a: Coordinates, b: Coordinates): number => {
  const rad = (value: number) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const value = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export const findCanonicalAdm4 = (coordinates: Coordinates, radiusKm = 5): string | undefined => {
  const match = points
    .map((point) => ({ point, distance: distanceKm(coordinates, point) }))
    .filter(({ distance }) => distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)[0];
  return match?.point.adm4;
};
