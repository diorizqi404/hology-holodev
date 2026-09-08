import { BigBoundaryClient } from './big-boundary-client.js';
import { BmkgAdm4Verifier } from './bmkg-adm4-verifier.js';
import type { LocationResolutionSpikeResult } from './location.types.js';

const DEFAULT_COORDINATES = { lat: -6.1647214778, lon: 106.8453837867 };
const DEFAULT_ADM4 = '35.73.05.1001';

const argument = (name: string): string | undefined => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const coordinates = {
  lat: Number(argument('--lat') ?? DEFAULT_COORDINATES.lat),
  lon: Number(argument('--lon') ?? DEFAULT_COORDINATES.lon),
};
const adm4 = argument('--adm4') ?? DEFAULT_ADM4;

const run = async (): Promise<void> => {
  const boundaryCandidate = await new BigBoundaryClient().findContainingPoint(coordinates);
  const adm4Verification = await new BmkgAdm4Verifier().verify(adm4);

  const result: LocationResolutionSpikeResult = {
    boundaryCandidate,
    adm4Verification,
    mappingVerified: false,
  };

  console.log(JSON.stringify(result, null, 2));
  console.error(
    '\nBIG candidate and BMKG adm4 are intentionally not auto-mapped. '
      + 'mappingVerified=false until a verified crosswalk exists.',
  );
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
