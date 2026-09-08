import type { BmkgRawResponse } from './bmkg.types.js';

const DEFAULT_ENDPOINT = 'https://api.bmkg.go.id/publik/prakiraan-cuaca';

export class BmkgClient {
  public constructor(
    private readonly fetcher: typeof fetch = fetch,
    private readonly endpoint = DEFAULT_ENDPOINT,
    private readonly timeoutMs = 10_000,
    private readonly maxAttempts = 2,
  ) {}

  public async fetchForecast(adm4: string): Promise<{ payload: BmkgRawResponse; requestUri: string }> {
    if (!/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(adm4)) {
      throw new Error('adm4 must use the BMKG format AA.BB.CC.DDDD');
    }

    const requestUri = `${this.endpoint}?${new URLSearchParams({ adm4 })}`;
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        const response = await this.fetcher(requestUri, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (response.ok) {
          return { payload: (await response.json()) as BmkgRawResponse, requestUri };
        }

        lastError = new Error(`BMKG request failed with HTTP ${response.status} for ${requestUri}`);
        if (response.status < 500) break;
      } catch (error: unknown) {
        lastError = error;
      }
    }

    throw new Error(
      `BMKG request unavailable: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
  }
}
