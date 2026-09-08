import type { SupabaseClient } from '@supabase/supabase-js';
import type { BmkgRawResponse } from '../bmkg/bmkg.types.js';

type CachedBmkgResponse = {
  adm4: string;
  rawPayload: BmkgRawResponse;
  fetchedAt: string;
  requestUri: string;
};

const bmkgRequestUri = (adm4: string): string =>
  `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(adm4)}`;

export class SupabaseBmkgCache {
  public constructor(
    private readonly supabase: SupabaseClient,
    private readonly ttlMinutes = 120,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  public async get(adm4: string): Promise<CachedBmkgResponse | undefined> {
    const { data, error } = await this.supabase
      .from('external_source_cache')
      .select('raw_payload, fetched_at, request_key, expires_at')
      .eq('source_name', 'BMKG')
      .eq('request_key', adm4)
      .eq('status', 'success')
      .gt('expires_at', this.clock().toISOString())
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    const rawPayload = data.raw_payload as unknown as BmkgRawResponse;
    return {
      adm4,
      rawPayload,
      fetchedAt: data.fetched_at,
      requestUri: bmkgRequestUri(adm4),
    };
  }

  public async set(entry: CachedBmkgResponse): Promise<void> {
    const expiresAt = new Date(
      this.clock().getTime() + this.ttlMinutes * 60_000,
    ).toISOString();
    const { error } = await this.supabase
      .from('external_source_cache')
      .insert({
        source_name: 'BMKG',
        request_key: entry.adm4,
        adm4_code: entry.adm4,
        raw_payload: entry.rawPayload,
        fetched_at: entry.fetchedAt,
        expires_at: expiresAt,
        status: 'success',
      });

    if (error) throw error;
  }
}
