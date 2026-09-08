import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const apiBase = process.env.E2E_API_BASE_URL ?? 'http://localhost:3000/api';
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) throw new Error('Supabase backend credentials are required');

const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const password = `Rt-${randomBytes(16).toString('base64url')}!`;
const farmerEmail = `e2e.farmer.${runId}@rembuktani.local`;
const reviewerEmail = `e2e.reviewer.${runId}@rembuktani.local`;

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} -> ${response.status}: ${payload.error ?? 'unknown error'}`);
  return payload;
}

async function expectRejected(path, expectedStatus, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status !== expectedStatus) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(`${method} ${path}: expected ${expectedStatus}, received ${response.status} (${payload.error ?? 'no error'})`);
  }
}

async function createActor(email, displayName, role) {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error(`Unable to create ${role}`);
  const { error: profileError } = await admin.from('profiles').upsert({
    user_id: data.user.id,
    display_name: displayName,
    role,
  }, { onConflict: 'user_id' });
  if (profileError) throw profileError;
  const login = await request('/auth/login', { method: 'POST', body: { identity: email, password } });
  if (login.user.role !== role) throw new Error(`Expected ${role}, received ${login.user.role}`);
  return { userId: data.user.id, token: login.session.accessToken };
}

const steps = [];
const mark = (name, details = {}) => steps.push({ name, ok: true, ...details });

async function main() {
  const farmer = await createActor(farmerEmail, `Petani E2E ${runId}`, 'farmer');
  const reviewer = await createActor(reviewerEmail, `Reviewer E2E ${runId}`, 'reviewer');
  mark('auth_farmer_and_reviewer');

  const { data: locationReferences, error: locationReferenceError } = await admin
    .from('lands')
    .select('latitude,longitude,province,regency,district,village,adm4_code')
    .not('adm4_code', 'is', null)
    .order('location_resolved_at', { ascending: false })
    .limit(1);
  if (locationReferenceError) throw locationReferenceError;
  const locationReference = locationReferences?.[0];
  if (!locationReference?.adm4_code) throw new Error('No verified ADM4 reference is available for BMKG E2E testing');

  const land = await request('/lands', { token: farmer.token, method: 'POST', body: {
    name: `Lahan Uji E2E ${runId}`,
    description: `E2E-REVIEW-${runId}: skenario defisit air untuk validasi alur reviewer`,
    latitude: locationReference.latitude,
    longitude: locationReference.longitude,
    province: locationReference.province,
    regency: locationReference.regency,
    district: locationReference.district,
    village: locationReference.village,
    adm4_code: locationReference.adm4_code,
    location_source: 'e2e_api_test',
  } });
  mark('create_land', { landId: land.id });

  const crop = await request(`/lands/${land.id}/crops`, { token: farmer.token, method: 'POST', body: {
    crop_name: 'Padi', variety_name: 'Inpari 32', growth_stage: 'flowering', planting_date: '2026-07-10',
  } });
  const decisionCase = await request('/decision-cases', { token: farmer.token, method: 'POST', body: {
    land_id: land.id, crop_context_id: crop.id, decision_type: 'water_condition',
  } });
  mark('create_crop_and_case', { caseId: decisionCase.id });

  const fieldPulse = await request(`/decision-cases/${decisionCase.id}/field-pulse`, { token: farmer.token, method: 'POST', body: {
    water_presence: 'limited', irrigation_flow: 'not_flowing',
    notes: 'Air menurun selama dua hari; aliran saluran hilir tidak terlihat.', reported_by: 'Petani E2E', is_mock: true,
  } });
  mark('submit_field_pulse', { evidenceId: fieldPulse.id });

  const bmkg = await request(`/decision-cases/${decisionCase.id}/bmkg/refresh`, { token: farmer.token, method: 'POST' });
  const bmkgDelivery = bmkg.delivery;
  if (!bmkg.evidence?.id || !['live', 'cached'].includes(bmkgDelivery)) throw new Error('BMKG evidence contract is incomplete');
  mark('refresh_bmkg', { delivery: bmkgDelivery, evidenceId: bmkg.evidence.id });

  const assessed = await request(`/decision-cases/${decisionCase.id}/assess`, { token: farmer.token, method: 'POST' });
  if (!assessed.assessment?.id || !Array.isArray(assessed.options) || assessed.options.length === 0) {
    throw new Error('Assessment did not produce an assessment and action options');
  }
  mark('assessment_and_ai_options', { assessmentId: assessed.assessment.id, optionCount: assessed.options.length });

  await request(`/decision-cases/${decisionCase.id}/reviews`, { token: farmer.token, method: 'POST', body: {} });
  const queue = await request('/reviewer/dashboard', { token: reviewer.token });
  if (!queue.pending_reviews.some((item) => item.case_id === decisionCase.id)) throw new Error('Case missing from reviewer queue');
  const detail = await request(`/reviewer/reviews/${decisionCase.id}`, { token: reviewer.token });
  if (detail.land.id !== land.id || detail.assessment.id !== assessed.assessment.id) throw new Error('Reviewer detail context mismatch');
  await expectRejected(`/reviewer/reviews/${decisionCase.id}`, 403, { token: farmer.token });
  mark('reviewer_queue_and_detail');
  mark('farmer_reviewer_detail_forbidden');

  const review = await request(`/decision-cases/${decisionCase.id}/reviews`, { token: reviewer.token, method: 'POST', body: {
    status: 'modify', assessment_id: assessed.assessment.id,
    comment: 'Verifikasi pintu air hilir dan koordinasikan giliran air sebelum memilih tindakan. Keputusan akhir tetap pada petani.',
  } });
  const reviews = await request(`/decision-cases/${decisionCase.id}/reviews`, { token: farmer.token });
  if (!reviews.some((item) => item.id === review.id && item.status === 'modify')) throw new Error('Farmer cannot read submitted review');
  await expectRejected(`/decision-cases/${decisionCase.id}/reviews`, 409, { token: reviewer.token, method: 'POST', body: {
    status: 'approve', assessment_id: assessed.assessment.id, comment: 'Duplicate review must be rejected.',
  } });
  mark('reviewer_submit_and_farmer_receive', { reviewId: review.id });
  mark('duplicate_review_rejected');

  const selected = assessed.options[0];
  const decision = await request(`/decision-cases/${decisionCase.id}/decision`, { token: farmer.token, method: 'POST', body: {
    assessment_id: assessed.assessment.id,
    selected_action_option_id: selected.id,
    decision_type: 'selected_option',
    decision_text: selected.title,
    reason: 'Dipilih setelah mempertimbangkan assessment sistem dan catatan reviewer.',
    authority: 'human', is_mock: true,
    assessment_snapshot: assessed.assessment,
    evidence_snapshot: { field_pulse: fieldPulse.id, bmkg_delivery: bmkgDelivery },
    evidence_ids: [fieldPulse.id],
  } });
  const brief = await request(`/decision-records/${decision.id}/brief`, { token: farmer.token, method: 'POST' });
  const records = await request('/decision-records', { token: farmer.token });
  if (!records.some((item) => item.id === decision.id) || !brief.content) throw new Error('Decision history or brief missing');
  await expectRejected(`/decision-cases/${decisionCase.id}/decision`, 409, { token: farmer.token, method: 'POST', body: {
    assessment_id: assessed.assessment.id, decision_type: 'custom', decision_text: 'Conflicting second decision',
  } });
  mark('farmer_final_decision_and_brief', { decisionId: decision.id, briefId: brief.id });
  mark('immutable_decision_conflict_rejected');

  const completed = await request('/reviewer/dashboard', { token: reviewer.token });
  if (!completed.completed_reviews.some((item) => item.review_id === review.id)) throw new Error('Review missing from completed history');
  if (completed.pending_reviews.some((item) => item.case_id === decisionCase.id)) throw new Error('Completed case remains in reviewer queue');
  mark('completed_history_and_queue_reconciliation');

  console.log(JSON.stringify({ runId, result: 'PASS', scenario: { landId: land.id, caseId: decisionCase.id, reviewId: review.id, decisionId: decision.id }, steps }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ runId, result: 'FAIL', error: error instanceof Error ? error.message : String(error), steps }, null, 2));
  process.exitCode = 1;
});
