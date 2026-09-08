import type { BoundaryCandidate, Coordinates } from './location.types.js';
import { assertCoordinates } from './location.types.js';

const DEFAULT_BIG_ENDPOINT =
  'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_DESAKEL_AR/MapServer/0/query';

type BigFeature = {
  attributes?: Record<string, unknown>;
};

type BigResponse = {
  features?: BigFeature[];
  error?: { message?: string };
};

const firstString = (
  attributes: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = attributes[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return undefined;
};

export class BigBoundaryClient {
  public constructor(
    private readonly fetcher: typeof fetch = fetch,
    private readonly endpoint = DEFAULT_BIG_ENDPOINT,
  ) {}

  public async findContainingPoint(coordinates: Coordinates): Promise<BoundaryCandidate> {
    assertCoordinates(coordinates);

    const params = new URLSearchParams({
      where: '1=1',
      geometry: JSON.stringify({ x: coordinates.lon, y: coordinates.lat }),
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'false',
      f: 'json',
    });

    let response: Response | undefined;
    let lastError: unknown;
    for (let attempt = 1; attempt <= 1; attempt += 1) {
      try {
        response = await this.fetcher(`${this.endpoint}?${params}`, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(8_000),
        });
        if (response.ok) break;
        lastError = new Error(`HTTP ${response.status}`);
        if (response.status < 500) break;
      } catch (error: unknown) {
        lastError = error;
      }
    }

    if (!response?.ok) {
      throw new Error(
        `BIG boundary request failed: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
      );
    }

    const body = (await response.json()) as BigResponse;
    if (body.error) {
      throw new Error(`BIG boundary request failed: ${body.error.message ?? 'unknown error'}`);
    }

    const attributes = body.features?.[0]?.attributes;
    if (!attributes) {
      throw new Error('BIG returned no boundary feature for the supplied point');
    }

    return {
      ...coordinates,
      provider: 'big',
      attributes,
      village: firstString(attributes, ['NAMOBJ', 'DESA', 'KELURAHAN', 'WADMKD']),
      district: firstString(attributes, ['WADMKC', 'KECAMATAN']),
      regency: firstString(attributes, ['WADMKK', 'KABKOTA', 'KOTAKAB']),
      province: firstString(attributes, ['WADMPR', 'PROVINSI']),
      adm4Candidate: firstString(attributes, ['KDEPUM', 'KDEBPS']),
    };
  }
}
