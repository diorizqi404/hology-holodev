import { config } from '../src/config.js';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/infrastructure/persistence/database.types.js';

const supabaseUrl = config.supabaseUrl;
const serviceRoleKey = config.serviceRoleKey;
const email = config.email ?? 'demo@rembuktani.local';
const password = config.password ?? 'RembukTani-Demo-2026!';

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const main = async (): Promise<void> => {
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError && !authError.message.toLowerCase().includes('already')) throw authError;

  let userId = created.user?.id;
  if (!userId) {
    const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    userId = users.users.find((user) => user.email === email)?.id;
  }
  if (!userId) throw new Error(`Unable to resolve demo auth user ${email}`);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, display_name: 'Demo RembukTani', role: 'farmer' }, { onConflict: 'user_id' })
    .select()
    .single();
  if (profileError) throw profileError;

  const { data: land, error: landError } = await supabase
    .from('lands')
    .insert({
      owner_id: profile.id,
      name: 'Blok Tirto A3',
      description: 'DEMO-WATER-01',
      latitude: -6.9271,
      longitude: 110.4305,
      province: 'Jawa Tengah',
      regency: 'Sleman',
      district: 'Kalasan',
      village: 'Purwomartani',
      adm4_code: '34.01.06.3002',
      location_source: 'demo_fixture',
    })
    .select()
    .single();
  if (landError) throw landError;

  const { data: crop, error: cropError } = await supabase
    .from('crop_contexts')
    .insert({ land_id: land.id, crop_name: 'Padi', variety_name: 'Inpari 32', growth_stage: 'vegetative', planting_date: '2026-08-15', is_active: true })
    .select()
    .single();
  if (cropError) throw cropError;

  const { data: decisionCase, error: caseError } = await supabase
    .from('decision_cases')
    .insert({ land_id: land.id, crop_context_id: crop.id, created_by: profile.id, decision_type: 'water_condition', status: 'draft' })
    .select()
    .single();
  if (caseError) throw caseError;

  const { error: evidenceError } = await supabase.from('decision_case_evidence').insert({
    decision_case_id: decisionCase.id,
    type: 'field_pulse',
    source: 'DEMO-WATER-01',
    payload: { water_presence: 'limited', irrigation_flow: 'not_flowing', reported_by: { type: 'fixture', id: 'DEMO-WATER-01' } },
    observed_at: new Date().toISOString(),
    freshness_status: 'fresh',
    quality_status: 'high',
    is_mock: true,
  });
  if (evidenceError) throw evidenceError;

  console.log(JSON.stringify({ email, userId, profileId: profile.id, landId: land.id, cropContextId: crop.id, decisionCaseId: decisionCase.id }, null, 2));
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
