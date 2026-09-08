export type Coordinates = {
  lat: number;
  lon: number;
};

export type BoundaryCandidate = Coordinates & {
  provider: 'big';
  attributes: Record<string, unknown>;
  village?: string;
  district?: string;
  regency?: string;
  province?: string;
  adm4Candidate?: string;
};

export type Adm4Verification = {
  adm4: string;
  location: Record<string, unknown>;
  forecastSlotCount: number;
  analysisTimes: string[];
};

export type LocationResolutionSpikeResult = {
  boundaryCandidate: BoundaryCandidate;
  adm4Verification: Adm4Verification;
  mappingVerified: false;
};

export const assertCoordinates = ({ lat, lon }: Coordinates): void => {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitude must be a finite number between -90 and 90');
  }

  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw new Error('Longitude must be a finite number between -180 and 180');
  }
};
