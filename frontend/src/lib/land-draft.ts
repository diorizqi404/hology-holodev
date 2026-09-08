export type LandDraft = {
  name: string;
  area?: string;
  locationMethod?: string;
  latitude?: number;
  longitude?: number;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  adm4Code?: string;
  locationSource?: string;
  boundaryPolygon?: [number, number][];
  locationResolved?: boolean;
};

const KEY = "rembuktani.land-draft.v1";

export function readLandDraft(): LandDraft {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}") as LandDraft; }
  catch { return {}; }
}

export function updateLandDraft(patch: Partial<LandDraft>): LandDraft {
  const next = { ...readLandDraft(), ...patch };
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearLandDraft() { sessionStorage.removeItem(KEY); }
