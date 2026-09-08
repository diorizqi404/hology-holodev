import { Router, type Request, type Response } from 'express';
import type { RepositoryFactory } from '../domain/repositories/factory.js';
import { assertProfileAccess, currentProfileId } from '../shared/auth.js';
import { BmkgAdapter } from '../infrastructure/bmkg/bmkg-adapter.js';
import { BigBoundaryClient } from '../infrastructure/location/big-boundary-client.js';
import { BmkgAdm4Verifier } from '../infrastructure/location/bmkg-adm4-verifier.js';
import { findCanonicalAdm4 } from '../infrastructure/location/canonical-adm4-map.js';

import { WaterReasoningEngine } from '../infrastructure/reasoning/water-reasoning-engine.js';
import { LlmReasoningEnhancer } from '../infrastructure/reasoning/llm-reasoning-enhancer.js';
import { ACTION_CATALOG } from '../infrastructure/reasoning/action-catalog.js';
import { formatDecisionBrief } from '../infrastructure/sharing/decision-brief-formatter.js';
import type { BmkgCanonicalEvidence } from '../infrastructure/bmkg/bmkg.types.js';
import type { FieldPulseEvidence } from '../infrastructure/reasoning/reasoning.types.js';
import type {
  AssessmentStatus,
  BasisStrength,
  CreateActionOptionInput,
  CreateAssessmentInput,
  CreateDecisionCaseEvidenceInput,
  CreateDecisionCaseInput,
  CreateDecisionBriefInput,
  CreateDecisionRecordInput,
  CreateTrustedReviewInput,
  CreateLandInput,
  CreateCropContextInput,
  DecisionCaseStatus,
  DecisionType,
  EvidenceType,
  FreshnessStatus,
  GrowthStage,
  TrustedReviewStatus,
} from '../domain/types.js';
import { config } from '../config.js';
import { randomUUID } from 'node:crypto';

const decisionCaseStatuses = new Set<DecisionCaseStatus>([
  'draft',
  'collecting_evidence',
  'assessed',
  'review_pending',
  'ready_for_decision',
  'decided',
]);
const assessmentStatuses = new Set<AssessmentStatus>([
  'draft',
  'active',
  'superseded',
  'archived',
]);
const evidenceTypes = new Set<EvidenceType>([
  'bmkg_forecast',
  'field_pulse',
  'crop_context',
  'external',
  'user_input',
]);
const freshnessStatuses = new Set<FreshnessStatus>(['fresh', 'stale', 'expired']);
const growthStages = new Set<GrowthStage>(['vegetative', 'flowering', 'ripening', 'unknown']);
const decisionTypes = new Set<DecisionType>(['selected_option', 'custom', 'deferred']);
const basisStrengths = new Set<BasisStrength>(['high', 'medium', 'low', 'insufficient']);
const trustedReviewStatuses = new Set<TrustedReviewStatus>(['approve', 'modify', 'reject']);
const isReviewerRole = (role: string | undefined): boolean => role === 'reviewer';
const reasoningInstanceId = randomUUID();

function bodyOf(request: Request): Record<string, unknown> {
  return request.body as Record<string, unknown>;
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function requiredNumber(value: unknown, field: string): number {
  const numberValue = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  if (!Number.isFinite(numberValue)) {
    throw new Error(`${field} must be a finite number`);
  }
  return numberValue;
}

function enumValue<T>(value: unknown, field: string, allowed: Set<T>): T {
  if (!allowed.has(value as T)) {
    throw new Error(`${field} has an invalid value`);
  }
  return value as T;
}

function sendError(response: Response, error: unknown): void {
  const message = error instanceof Error ? error.message : 'Request failed';
  const status = error instanceof Error && error.name === 'ForbiddenError'
    ? 403
    : message.endsWith('is required') || message.includes('has an invalid value') || message.includes('must be') || message.includes('could not be resolved')
      ? 400
      : 500;
  response.status(status).json({ error: message });
}

type ApiDependencies = {
  bmkgAdapter?: BmkgAdapter;
  reasoningEngine?: WaterReasoningEngine;
  llmEnhancer?: LlmReasoningEnhancer;
  boundaryClient?: BigBoundaryClient;
  adm4Verifier?: BmkgAdm4Verifier;
};

export function createApiRouter(
  repositories: RepositoryFactory,
  dependencies: ApiDependencies = {},
): Router {
  const router = Router();
  const bmkgAdapter = dependencies.bmkgAdapter ?? new BmkgAdapter();
  const reasoningEngine = dependencies.reasoningEngine ?? new WaterReasoningEngine();
  const llmEnhancer = dependencies.llmEnhancer ?? new LlmReasoningEnhancer();
  const boundaryClient = dependencies.boundaryClient ?? new BigBoundaryClient();
  const adm4Verifier = dependencies.adm4Verifier ?? new BmkgAdm4Verifier();
  const withCatalogIds = <T extends { title: string }>(options: T[]) => options.map((option) => ({
    ...option,
    catalog_option_id: ACTION_CATALOG.find((catalogItem) => catalogItem.title === option.title)?.optionId ?? null,
  }));


  const ensureLandAccess = async (request: Request, landId: string): Promise<void> => {
    const land = await repositories.lands.getById(landId);
    if (!land) throw new Error('Land not found');
    assertProfileAccess(request, land.owner_id);
  };

  const ensureCaseAccess = async (request: Request, decisionCaseId: string): Promise<void> => {
    const decisionCase = await repositories.decisionCases.getById(decisionCaseId);
    if (!decisionCase) throw new Error('Decision case not found');
    await ensureLandAccess(request, decisionCase.land_id);
  };

  const requireReviewer = (request: Request): void => {
    if (!isReviewerRole(request.auth?.profile.role)) {
      const error = new Error('Only reviewer role can access reviewer resources');
      error.name = 'ForbiddenError';
      throw error;
    }
  };

  const newestEvidence = (context: any, type: EvidenceType): any | null => {
    const matches = (context?.evidence ?? []).filter((item: any) => item.type === type);
    return matches.sort((left: any, right: any) =>
      new Date(right.collected_at ?? right.created_at ?? 0).getTime()
      - new Date(left.collected_at ?? left.created_at ?? 0).getTime())[0] ?? null;
  };

  const reviewerForecast = (context: any) => {
    const evidence = newestEvidence(context, 'bmkg_forecast');
    const slots = evidence?.payload?.forecast_slots ?? evidence?.payload?.payload?.forecast_slots;
    const slot = Array.isArray(slots)
      ? slots.find((value: any) => new Date(value.target_time_utc ?? value.target_time_local ?? 0).getTime() >= Date.now()) ?? slots[0]
      : undefined;
    return slot ? {
      condition: slot.weather_desc ?? 'Prakiraan tersedia',
      temp: typeof slot.t === 'number' ? slot.t : 0,
      humidity: typeof slot.hu === 'number' ? slot.hu : null,
      wind_speed: typeof slot.ws === 'number' ? slot.ws : null,
      wind_direction: slot.wd ?? null,
      target_time: slot.target_time_local ?? slot.target_time_utc ?? null,
      source: evidence.source ?? 'BMKG',
      freshness_status: evidence.freshness_status ?? null,
    } : null;
  };

  const reviewerFieldPulse = (context: any) => {
    const evidence = newestEvidence(context, 'field_pulse');
    if (!evidence) return null;
    const payload = evidence.payload ?? {};
    return {
      water_presence: String(payload.water_presence ?? 'unknown'),
      irrigation_flow: String(payload.irrigation_flow ?? 'unknown'),
      notes: typeof payload.notes === 'string' ? payload.notes : null,
      observed_at: evidence.observed_at ?? evidence.collected_at ?? null,
      freshness_status: evidence.freshness_status ?? null,
    };
  };

  const reviewerAssignment = (context: any): { reviewer_id?: string; assessment_id?: string } | null => {
    const evidence = (context?.evidence ?? [])
      .filter((item: any) => item.type === 'user_input' && item.source === 'trusted_reviewer_assignment')
      .sort((left: any, right: any) =>
        new Date(right.collected_at ?? right.created_at ?? 0).getTime()
        - new Date(left.collected_at ?? left.created_at ?? 0).getTime())[0];
    return evidence?.payload ?? null;
  };

  const reviewerAssessment = (context: any, assessmentId?: string) => {
    const assessments = [...(context?.assessments ?? [])].sort((a: any, b: any) => b.version - a.version);
    return (assessmentId ? assessments.find((item: any) => item.id === assessmentId) : null)
      ?? assessments.find((item: any) => item.status === 'active')
      ?? assessments[0]
      ?? null;
  };

  const reviewerLocation = (land: any): string =>
    [land?.village, land?.district, land?.regency, land?.province].filter(Boolean).join(', ') || 'Lokasi belum tersedia';

  router.get('/reasoning/status', (_request, response) => {
    response.json({ mode: config.llmEnabled ? 'llm_enhanced' : 'deterministic_fallback', provider: config.llmEnabled ? 'google-gemini' : null, model: config.llmEnabled ? config.llmModel : null, instance_id: reasoningInstanceId });
  });

  router.get('/profile', (request, response) => {
    const profile = request.auth!.profile;
    const user = request.auth!.user;
    response.json({
      ...profile,
      email: user.email ?? null,
      phone: user.phone ?? null,
      email_confirmed_at: user.email_confirmed_at ?? null,
      last_sign_in_at: user.last_sign_in_at ?? null,
    });
  });

  router.get('/reviewers', async (_request, response) => {
    try {
      const reviewers = await repositories.profiles.getByRole('reviewer');
      response.json(reviewers.map((reviewer) => ({
        id: reviewer.id,
        display_name: reviewer.display_name,
        role: reviewer.role,
        avatar_url: reviewer.avatar_url ?? null,
        created_at: reviewer.created_at,
        updated_at: reviewer.updated_at,
      })));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/reviewer/dashboard', async (request, response) => {
    try {
      requireReviewer(request);

      const reviewerId = currentProfileId(request);
      const pendingCases = await repositories.decisionCases.getAll({ status: 'review_pending' });
      const pendingContexts = await Promise.all(pendingCases.map((item) => repositories.decisionCases.getWithContext(item.id)));
      const completedReviews = (await repositories.trustedReviews.getByReviewer(reviewerId))
        .sort((left, right) => new Date(right.responded_at ?? right.created_at).getTime() - new Date(left.responded_at ?? left.created_at).getTime());
      const completedContexts = await Promise.all(completedReviews.map((item) => repositories.decisionCases.getWithContext(item.decision_case_id)));

      const pending = pendingContexts.filter((context: any) => {
        if (!context) return false;
        const assignment = reviewerAssignment(context);
        return !assignment?.reviewer_id || assignment.reviewer_id === reviewerId;
      }).map((context: any) => {
        const assignment = reviewerAssignment(context);
        const assessment = reviewerAssessment(context, assignment?.assessment_id);
        return ({
        review_id: context.id,
        case_id: context.id,
        land_name: context.land?.name ?? 'Lahan',
        farmer_name: context.created_by_profile?.display_name ?? 'Petani',
        location: reviewerLocation(context.land),
        crop_name: context.crop_context?.crop_name ?? 'Tanaman belum dicatat',
        growth_stage: context.crop_context?.growth_stage ?? 'unknown',
        decision_type: context.decision_type,
        submitted_at: context.updated_at ?? context.created_at,
        assessment: assessment ? { id: assessment.id, summary: assessment.summary, basis_strength: assessment.basis_strength ?? null } : null,
        evidence: {
          bmkg: reviewerForecast(context),
          field_pulse: (() => {
            const pulse = reviewerFieldPulse(context);
            return pulse ? { condition: pulse.water_presence, text: pulse.notes ?? pulse.irrigation_flow } : null;
          })(),
        },
        });
      });
      const completed = completedReviews.map((review, index) => {
        const context: any = completedContexts[index];
        const assessments = [...(context?.assessments ?? [])].sort((a: any, b: any) => b.version - a.version);
        const assessment = assessments.find((item: any) => item.status === 'active') ?? assessments[0] ?? null;
        const bmkg = reviewerForecast(context);
        const pulse = reviewerFieldPulse(context);
        return {
          review_id: review.id,
          land_name: context?.land?.name ?? 'Lahan',
          farmer_name: context?.created_by_profile?.display_name ?? 'Petani',
          village: context?.land?.village ?? 'Lokasi belum tersedia',
          status: review.status,
          comment: review.comment ?? '',
          responded_at: review.responded_at ?? review.created_at,
          assessment: assessment ? { summary: assessment.summary, basis_strength: assessment.basis_strength ?? null } : null,
          evidence_labels: [
            bmkg ? `BMKG (${bmkg.condition} ${bmkg.temp}°C)` : null,
            pulse ? `Kondisi Lapangan (${pulse.water_presence}; ${pulse.irrigation_flow})` : null,
            context?.crop_context ? `Tanaman (${[context.crop_context.crop_name, context.crop_context.variety_name].filter(Boolean).join(' ')})` : null,
          ].filter(Boolean),
        };
      });

      response.json({
        stats: { pending_count: pending.length, urgent_count: pending.filter((item) => item.evidence.field_pulse?.condition === 'none').length },
        reviewer_name: request.auth?.profile.display_name ?? 'Reviewer',
        region: pending[0]?.location ?? reviewerLocation((completedContexts[0] as any)?.land),
        weather: pending[0]?.evidence.bmkg ?? reviewerForecast(completedContexts[0] as any),
        pending_reviews: pending,
        completed_reviews: completed,
      });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/reviewer/reviews/:decisionCaseId', async (request, response) => {
    try {
      requireReviewer(request);
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      const context: any = await repositories.decisionCases.getWithContext(decisionCaseId);
      if (!context) {
        response.status(404).json({ error: 'Decision case not found' });
        return;
      }
      const reviewerId = currentProfileId(request);
      const assignment = reviewerAssignment(context);
      const priorReview = (await repositories.trustedReviews.getByDecisionCaseId(decisionCaseId))
        .find((review) => review.reviewer_id === reviewerId) ?? null;
      if (assignment?.reviewer_id && assignment.reviewer_id !== reviewerId && !priorReview) {
        const error = new Error('Review is assigned to another reviewer');
        error.name = 'ForbiddenError';
        throw error;
      }
      if (context.status !== 'review_pending' && !priorReview) {
        const error = new Error('Review is not available to this reviewer');
        error.name = 'ForbiddenError';
        throw error;
      }
      const assessment = reviewerAssessment(context, assignment?.assessment_id);
      const options = assessment ? withCatalogIds(await repositories.actionOptions.getByAssessmentId(assessment.id)) : [];
      response.json({
        case_id: context.id,
        status: context.status,
        decision_type: context.decision_type,
        submitted_at: context.updated_at ?? context.created_at,
        land: {
          id: context.land?.id,
          name: context.land?.name ?? 'Lahan',
          description: context.land?.description ?? null,
          location: reviewerLocation(context.land),
          village: context.land?.village ?? null,
          district: context.land?.district ?? null,
          regency: context.land?.regency ?? null,
          province: context.land?.province ?? null,
          latitude: context.land?.latitude ?? null,
          longitude: context.land?.longitude ?? null,
        },
        farmer: { name: context.created_by_profile?.display_name ?? 'Petani' },
        crop: context.crop_context ? {
          name: context.crop_context.crop_name,
          variety: context.crop_context.variety_name ?? null,
          growth_stage: context.crop_context.growth_stage,
          planting_date: context.crop_context.planting_date ?? null,
        } : null,
        evidence: { bmkg: reviewerForecast(context), field_pulse: reviewerFieldPulse(context) },
        assessment: assessment ? {
          id: assessment.id,
          summary: assessment.summary,
          basis_strength: assessment.basis_strength ?? null,
          factors: assessment.factors ?? [],
          missing_evidence: assessment.missing_evidence ?? [],
          limitations: assessment.limitations ?? [],
          rule_version: assessment.rule_version ?? null,
        } : null,
        action_options: options,
        prior_review: priorReview,
      });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/lands', async (request, response) => {
    try {
      const ownerId = currentProfileId(request);
      response.json(await repositories.lands.getByOwnerId(ownerId));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/lands/:landId/bmkg', async (request, response) => {
    try {
      const landId = requiredString(request.params.landId, 'landId');
      await ensureLandAccess(request, landId);
      const land = await repositories.lands.getById(landId);
      if (!land) {
        response.status(404).json({ error: 'Land not found' });
        return;
      }
      if (!land.adm4_code) {
        response.json({ weather: null });
        return;
      }

      const result = await bmkgAdapter.getEvidence(land.adm4_code, land.id, `weather:${land.id}`);
      response.json({ weather: result.evidence, delivery: result.delivery, fetched_at: result.fetchedAt });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/lands', async (request, response) => {
    try {
      const body = bodyOf(request);
      const input: CreateLandInput = {
        owner_id: currentProfileId(request),
        name: requiredString(body.name, 'name'),
        latitude: requiredNumber(body.latitude, 'latitude'),
        longitude: requiredNumber(body.longitude, 'longitude'),
        boundary_polygon: Array.isArray(body.boundary_polygon) ? body.boundary_polygon as [number, number][] : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        province: typeof body.province === 'string' ? body.province : undefined,
        regency: typeof body.regency === 'string' ? body.regency : undefined,
        district: typeof body.district === 'string' ? body.district : undefined,
        village: typeof body.village === 'string' ? body.village : undefined,
        adm4_code: typeof body.adm4_code === 'string' ? body.adm4_code : undefined,
        location_source: typeof body.location_source === 'string' ? body.location_source : undefined,
        archived_at: undefined,
      };
      const adm4 = input.adm4_code;
      const hasManualLocation = [input.province, input.regency, input.district, input.village]
        .every((value) => typeof value === 'string' && value.trim() !== '');
      let resolvedLocation:
        | {
            province: string;
            regency: string;
            district: string;
            village: string;
            location_source: string;
          }
        | undefined;

      if (adm4) {
        try {
          const verification = await adm4Verifier.verify(adm4);
          const location = verification.location;
          const bmkgLocation = {
            province: typeof location.provinsi === 'string' ? location.provinsi : '',
            regency: typeof location.kotkab === 'string' ? location.kotkab : '',
            district: typeof location.kecamatan === 'string' ? location.kecamatan : '',
            village: typeof location.desa === 'string' ? location.desa : '',
            location_source: 'bmkg_verified',
          };
          if (Object.values(bmkgLocation).some((value) => typeof value === 'string' && value === '')) {
            throw new Error('BMKG location is incomplete');
          }
          resolvedLocation = bmkgLocation;
        } catch {
          try {
            const boundaryCandidate = await boundaryClient.findContainingPoint({
              lat: input.latitude,
              lon: input.longitude,
            });
            const bigLocation = {
              province: boundaryCandidate.province ?? '',
              regency: boundaryCandidate.regency ?? '',
              district: boundaryCandidate.district ?? '',
              village: boundaryCandidate.village ?? '',
              location_source: 'big_boundary_candidate',
            };
            if (Object.values(bigLocation).some((value) => typeof value === 'string' && value === '')) {
              throw new Error('BIG location is incomplete');
            }
            resolvedLocation = bigLocation;
          } catch {
            if (!hasManualLocation) {
              throw new Error(`adm4 could not be resolved: ${adm4}`);
            }
          }
        }
      }

      const createdLand = await repositories.lands.createLand(input.owner_id, {
        ...input,
        ...(resolvedLocation ?? {}),
      });
      let resolvedLand = createdLand;
      if (adm4 && resolvedLocation) {
        resolvedLand = await repositories.lands.resolveLocation(createdLand.id, adm4, resolvedLocation);
      } else if (adm4 && hasManualLocation) {
        resolvedLand = await repositories.lands.updateLand(createdLand.id, {
          location_source: input.location_source ?? 'client_provided',
          location_resolved_at: new Date().toISOString(),
        });
      } else if (!adm4) {
        try {
          const boundaryCandidate = await boundaryClient.findContainingPoint({
            lat: input.latitude,
            lon: input.longitude,
          });
          resolvedLand = await repositories.lands.updateLand(createdLand.id, {
            province: boundaryCandidate.province,
            regency: boundaryCandidate.regency,
            district: boundaryCandidate.district,
            village: boundaryCandidate.village,
            location_source: 'big_boundary_candidate',
            location_resolved_at: new Date().toISOString(),
          });
        } catch {
          resolvedLand = await repositories.lands.updateLand(createdLand.id, {
            location_source: input.location_source ?? 'client_provided',
            location_resolved_at: new Date().toISOString(),
          });
        }
      }

      response.status(201).json(resolvedLand);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/lands/:id', async (request, response) => {
    try {
      const landId = requiredString(request.params.id, 'id');
      await ensureLandAccess(request, landId);
      const land = await repositories.lands.getWithActiveCrop(landId);
      if (!land) {
        response.status(404).json({ error: 'Land not found' });
        return;
      }
      response.json(land);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.patch('/lands/:id', async (request, response) => {
    try {
      const landId = requiredString(request.params.id, 'id');
      await ensureLandAccess(request, landId);
      const body = bodyOf(request);
      const input = {
        name: typeof body.name === 'string' ? body.name : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        latitude: body.latitude === undefined ? undefined : requiredNumber(body.latitude, 'latitude'),
        longitude: body.longitude === undefined ? undefined : requiredNumber(body.longitude, 'longitude'),
        province: typeof body.province === 'string' ? body.province : undefined,
        regency: typeof body.regency === 'string' ? body.regency : undefined,
        district: typeof body.district === 'string' ? body.district : undefined,
        village: typeof body.village === 'string' ? body.village : undefined,
        adm4_code: typeof body.adm4_code === 'string' ? body.adm4_code : undefined,
        location_source: typeof body.location_source === 'string' ? body.location_source : undefined,
      };
      response.json(await repositories.lands.updateLand(landId, input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.delete('/lands/:id', async (request, response) => {
    try {
      const landId = requiredString(request.params.id, 'id');
      await ensureLandAccess(request, landId);
      response.json(await repositories.lands.archiveLand(landId));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/lands/:landId/crops', async (request, response) => {
    try {
      const landId = requiredString(request.params.landId, 'landId');
      await ensureLandAccess(request, landId);
      response.json(await repositories.cropContexts.getByLandId(landId));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/lands/:landId/crop-context', async (request, response) => {
    try {
      const landId = requiredString(request.params.landId, 'landId');
      await ensureLandAccess(request, landId);
      const crop = await repositories.cropContexts.getActiveCrop(landId);
      if (!crop) {
        response.status(404).json({ error: 'Active crop context not found' });
        return;
      }
      response.json(crop);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/lands/:landId/crops', async (request, response) => {
    try {
      const landId = requiredString(request.params.landId, 'landId');
      await ensureLandAccess(request, landId);
      const body = bodyOf(request);
      const input: CreateCropContextInput = {
        land_id: landId,
        crop_name: requiredString(body.crop_name, 'crop_name'),
        variety_name: typeof body.variety_name === 'string' ? body.variety_name : undefined,
        growth_stage: enumValue(body.growth_stage ?? 'unknown', 'growth_stage', growthStages),
        planting_date: typeof body.planting_date === 'string' ? body.planting_date : undefined,
        is_active: true,
      };
      response.status(201).json(await repositories.cropContexts.createCrop(input.land_id, input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases', async (request, response) => {
    try {
      const body = bodyOf(request);
      const landId = requiredString(body.land_id, 'land_id');
      await ensureLandAccess(request, landId);
      const input: CreateDecisionCaseInput = {
        land_id: landId,
        crop_context_id: requiredString(body.crop_context_id, 'crop_context_id'),
        created_by: currentProfileId(request),
        decision_type: requiredString(body.decision_type, 'decision_type'),
        status: 'draft',
      };
      response.status(201).json(await repositories.decisionCases.createCase(input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases', async (request, response) => {
    try {
      const ownerId = currentProfileId(request);
      response.json(await repositories.decisionCases.getByOwnerId(ownerId));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases/:id', async (request, response) => {
    try {
      const caseId = requiredString(request.params.id, 'id');
      await ensureCaseAccess(request, caseId);
      const decisionCase = await repositories.decisionCases.getWithContext(caseId);
      if (!decisionCase) {
        response.status(404).json({ error: 'Decision case not found' });
        return;
      }
      response.json(decisionCase);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.patch('/decision-cases/:id/status', async (request, response) => {
    try {
      const caseId = requiredString(request.params.id, 'id');
      await ensureCaseAccess(request, caseId);
      const status = enumValue(bodyOf(request).status, 'status', decisionCaseStatuses);
      response.json(await repositories.decisionCases.updateStatus(caseId, status));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases/:decisionCaseId/evidence', async (request, response) => {
    try {
      const caseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, caseId);
      response.json(await repositories.evidence.getByDecisionCaseId(caseId));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/evidence', async (request, response) => {
    try {
      const caseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, caseId);
      const body = bodyOf(request);
      const input: CreateDecisionCaseEvidenceInput = {
        decision_case_id: caseId,
        type: enumValue(body.type, 'type', evidenceTypes),
        source: typeof body.source === 'string' ? body.source : undefined,
        payload: typeof body.payload === 'object' && body.payload !== null ? body.payload as Record<string, unknown> : {},
        observed_at: typeof body.observed_at === 'string' ? body.observed_at : undefined,
        freshness_status: body.freshness_status === undefined ? undefined : enumValue(body.freshness_status, 'freshness_status', freshnessStatuses),
        quality_status: typeof body.quality_status === 'string' ? body.quality_status as CreateDecisionCaseEvidenceInput['quality_status'] : undefined,
        is_mock: body.is_mock === true,
      };
      response.status(201).json(await repositories.evidence.createEvidence(input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/locations/resolve', async (request, response) => {
    try {
      const body = bodyOf(request);
      const lat = requiredNumber(body.lat, 'lat');
      const lon = requiredNumber(body.lon, 'lon');
      const requestedAdm4 = typeof body.adm4 === 'string' && body.adm4.trim() ? body.adm4.trim() : undefined;
      let boundaryCandidate;
      try {
        boundaryCandidate = await boundaryClient.findContainingPoint({ lat, lon });
      } catch (error) {
        const canonicalAdm4 = requestedAdm4 ?? findCanonicalAdm4({ lat, lon });
        if (!canonicalAdm4) throw error;
        const verified = await adm4Verifier.verify(canonicalAdm4);
        boundaryCandidate = {
          lat,
          lon,
          provider: 'bmkg-canonical-fallback',
          attributes: verified.location,
          province: typeof verified.location.provinsi === 'string' ? verified.location.provinsi : undefined,
          regency: typeof verified.location.kotkab === 'string' ? verified.location.kotkab : undefined,
          district: typeof verified.location.kecamatan === 'string' ? verified.location.kecamatan : undefined,
          village: typeof verified.location.desa === 'string' ? verified.location.desa : undefined,
          adm4Candidate: canonicalAdm4,
        };
      }
      const candidateAdm4 = boundaryCandidate.adm4Candidate;
      const adm4 = requestedAdm4 ?? (candidateAdm4 && /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(candidateAdm4) ? candidateAdm4 : undefined);
      const adm4Verification = adm4 ? await adm4Verifier.verify(adm4) : null;
      response.json({
        boundaryCandidate,
        adm4Verification,
        mappingVerified: Boolean(adm4Verification),
        mappingNote: adm4Verification
          ? 'ADM4 kandidat dari boundary diverifikasi ulang ke BMKG.'
          : 'Nama wilayah berasal dari boundary BIG; ADM4 BMKG belum tersedia untuk titik ini.',
      });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/bmkg/refresh', async (request, response) => {
    try {
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, decisionCaseId);
      const decisionCase = await repositories.decisionCases.getById(decisionCaseId);
      if (!decisionCase) {
        response.status(404).json({ error: 'Decision case not found' });
        return;
      }
      const land = await repositories.lands.getById(decisionCase.land_id);
      if (!land?.adm4_code) {
        response.status(409).json({ error: 'Land has no verified adm4_code' });
        return;
      }

      const result = await bmkgAdapter.getEvidence(land.adm4_code, land.id, decisionCase.id);
      const evidence = await repositories.evidence.createEvidence({
        decision_case_id: decisionCase.id,
        type: 'bmkg_forecast',
        source: 'BMKG',
        payload: result.evidence,
        observed_at: result.evidence.temporal.analysis_time,
        freshness_status: result.delivery === 'live' ? 'fresh' : 'stale',
        quality_status: 'uncertain',
        is_mock: result.evidence.provenance.is_mock,
      });

      response.status(201).json({
        evidence,
        delivery: result.delivery,
        fetched_at: result.fetchedAt,
        normalization_warnings: result.normalizationWarnings,
        attribution: result.evidence.source,
      });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/field-pulse', async (request, response) => {
    try {
      const caseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, caseId);
      const body = bodyOf(request);
      const waterPresence = enumValue(body.water_presence, 'water_presence', new Set(['present', 'limited', 'none', 'unknown']));
      const irrigationFlow = enumValue(body.irrigation_flow, 'irrigation_flow', new Set(['flowing', 'limited', 'not_flowing', 'unknown']));
      const waterTrend = body.water_trend === undefined ? undefined : enumValue(body.water_trend, 'water_trend', new Set(['kering', 'tetap', 'basah', 'gatau']));
      const evidence = await repositories.evidence.createEvidence({
        decision_case_id: caseId,
        type: 'field_pulse',
        source: 'Field Pulse',
        payload: {
          water_presence: waterPresence,
          irrigation_flow: irrigationFlow,
          water_trend: waterTrend,
          reported_by: body.reported_by,
          notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : undefined,
        },
        observed_at: typeof body.observed_at === 'string' ? body.observed_at : new Date().toISOString(),
        freshness_status: 'fresh',
        quality_status: 'high',
        is_mock: body.is_mock === true,
      });
      response.status(201).json(evidence);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases/:decisionCaseId/assessments', async (request, response) => {
    try {
      const caseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, caseId);
      response.json(await repositories.assessments.getByDecisionCaseId(caseId));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/assess', async (request, response) => {
    try {
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, decisionCaseId);
      const caseEvidence = await repositories.evidence.getByDecisionCaseId(decisionCaseId);
      const newestFirst = [...caseEvidence].sort((a, b) => b.collected_at.localeCompare(a.collected_at));
      const bmkgEvidence = newestFirst.find((item) => item.type === 'bmkg_forecast');
      const fieldEvidence = newestFirst.find((item) => item.type === 'field_pulse');
      const fieldPayload = fieldEvidence?.payload ?? {};
      const fieldPulse: FieldPulseEvidence | undefined = fieldEvidence
        ? {
            evidenceId: fieldEvidence.id,
            observedAt: fieldEvidence.observed_at,
            waterPresence: fieldPayload.water_presence as FieldPulseEvidence['waterPresence'],
            irrigationFlow: fieldPayload.irrigation_flow as FieldPulseEvidence['irrigationFlow'],
            waterTrend: fieldPayload.water_trend as FieldPulseEvidence['waterTrend'],
          }
        : undefined;
      const bmkg = bmkgEvidence
        ? {
            evidenceId: bmkgEvidence.id,
            evidence: bmkgEvidence.payload as unknown as BmkgCanonicalEvidence,
            delivery: bmkgEvidence.freshness_status === 'stale' ? 'cached' as const : 'live' as const,
          }
        : undefined;
      const decisionCase = await repositories.decisionCases.getById(decisionCaseId);
      const crop = decisionCase ? await repositories.cropContexts.getById(decisionCase.crop_context_id) : null;
      const reasoningInput = {
        decisionCaseId,
        evaluatedAt: new Date().toISOString(),
        bmkg,
        fieldPulse,
        cropContext: crop ? {
          cropContextId: crop.id,
          cropName: crop.crop_name,
          varietyName: crop.variety_name,
          growthStage: crop.growth_stage,
          plantingDate: crop.planting_date,
        } : undefined,
      };
      const baseline = reasoningEngine.evaluate(reasoningInput);
      const result = await llmEnhancer.enhance(reasoningInput, baseline, crop);
      const createdAssessment = await repositories.assessments.createAssessment({
        decision_case_id: decisionCaseId,
        version: await repositories.assessments.getNextVersion(decisionCaseId),
        status: 'active',
        summary: result.generatedSummary ?? result.summary,
        basis_strength: result.confidence,
        factors: result.factors,
        missing_evidence: result.missingEvidence,
        limitations: result.limitations,
        rule_version: result.rulesetVersion,
      });
      const assessment = await repositories.assessments.setActive(createdAssessment.id);
      await repositories.assessments.linkEvidence(assessment.id, caseEvidence.map((item) => item.id));
      const options = await repositories.actionOptions.createOptions(
        assessment.id,
        result.actionOptions.map((option, displayOrder) => ({
          title: option.title,
          description: option.description,
          rationale: option.rationale,
          display_order: displayOrder,
        })),
      );
      await repositories.decisionCases.updateStatus(decisionCaseId, 'assessed');
      response.status(201).json({ assessment, options: withCatalogIds(options), reasoning: result });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases/:decisionCaseId/assessment', async (request, response) => {
    try {
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, decisionCaseId);
      const assessment = await repositories.assessments.getLatestActive(decisionCaseId);
      if (!assessment) {
        response.status(404).json({ error: 'Assessment not found' });
        return;
      }
      const options = await repositories.actionOptions.getByAssessmentId(assessment.id);
      response.json({ assessment, options: withCatalogIds(options) });
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/assessments', async (request, response) => {
    try {
      const body = bodyOf(request);
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      const input: CreateAssessmentInput = {
        decision_case_id: decisionCaseId,
        version: typeof body.version === 'number' ? body.version : await repositories.assessments.getNextVersion(decisionCaseId),
        status: enumValue(body.status ?? 'draft', 'status', assessmentStatuses),
        summary: requiredString(body.summary, 'summary'),
        basis_strength: body.basis_strength === undefined ? undefined : enumValue(body.basis_strength, 'basis_strength', basisStrengths),
        factors: Array.isArray(body.factors) ? body.factors.filter((value): value is string => typeof value === 'string') : undefined,
        missing_evidence: Array.isArray(body.missing_evidence) ? body.missing_evidence.filter((value): value is string => typeof value === 'string') : undefined,
        limitations: Array.isArray(body.limitations) ? body.limitations.filter((value): value is string => typeof value === 'string') : undefined,
        rule_version: typeof body.rule_version === 'string' ? body.rule_version : undefined,
      };
      response.status(201).json(await repositories.assessments.createAssessment(input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/assessments/:assessmentId/options', async (request, response) => {
    try {
      response.json(withCatalogIds(await repositories.actionOptions.getByAssessmentId(requiredString(request.params.assessmentId, 'assessmentId'))));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/assessments/:assessmentId/options', async (request, response) => {
    try {
      const body = bodyOf(request);
      const input: CreateActionOptionInput = {
        assessment_id: requiredString(request.params.assessmentId, 'assessmentId'),
        title: requiredString(body.title, 'title'),
        description: typeof body.description === 'string' ? body.description : undefined,
        rationale: typeof body.rationale === 'string' ? body.rationale : undefined,
        display_order: typeof body.display_order === 'number' ? body.display_order : 0,
      };
      response.status(201).json(await repositories.actionOptions.createOption(input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/reviews', async (request, response) => {
    try {
      const body = bodyOf(request);
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      const actorId = currentProfileId(request);
      const status = body.status === undefined
        ? undefined
        : enumValue(body.status, 'status', trustedReviewStatuses);

      if (!status) {
        // Farmer (case owner) requests a trusted review
        await ensureCaseAccess(request, decisionCaseId);
        const assessmentId = typeof body.assessment_id === 'string' ? body.assessment_id : undefined;
        const selectedReviewerId = typeof body.reviewer_id === 'string' ? body.reviewer_id : undefined;
        const selectedOptionId = typeof body.selected_action_option_id === 'string' ? body.selected_action_option_id : undefined;
        if (selectedReviewerId) {
          const reviewer = await repositories.profiles.getById(selectedReviewerId);
          if (!reviewer || reviewer.role !== 'reviewer') throw new Error('Selected reviewer is not available');
        }
        if (assessmentId) {
          const assessment = await repositories.assessments.getById(assessmentId);
          if (!assessment || assessment.decision_case_id !== decisionCaseId) {
            throw new Error('assessment_id does not belong to the decision case');
          }
        }
        if (selectedOptionId) {
          if (!assessmentId) throw new Error('assessment_id is required when selecting an action option');
          const options = await repositories.actionOptions.getByAssessmentId(assessmentId);
          if (!options.some((option) => option.id === selectedOptionId)) {
            throw new Error('selected_action_option_id does not belong to the assessment');
          }
        }
        const updatedCase = await repositories.decisionCases.updateCase(decisionCaseId, {
          status: 'review_pending',
          selected_action_option_id: selectedOptionId,
        });
        if (selectedReviewerId) {
          await repositories.evidence.createEvidence({
            decision_case_id: decisionCaseId,
            type: 'user_input',
            source: 'trusted_reviewer_assignment',
            payload: {
              reviewer_id: selectedReviewerId,
              assessment_id: assessmentId,
              selected_action_option_id: selectedOptionId,
            },
            freshness_status: 'fresh',
            quality_status: 'high',
            is_mock: false,
          });
        }
        response.status(202).json({ decision_case: updatedCase, status: 'review_pending' });
        return;
      }

      // Only reviewer role can submit approve/reject
      if (!isReviewerRole(request.auth?.profile.role)) {
        const error = new Error('Only reviewer role can submit a review');
        error.name = 'ForbiddenError';
        throw error;
      }

      const decisionCase = await repositories.decisionCases.getById(decisionCaseId);
      if (!decisionCase) throw new Error('Decision case not found');
      if (decisionCase.status !== 'review_pending') {
        response.status(409).json({ error: 'Decision case is not awaiting review' });
        return;
      }

      const context: any = await repositories.decisionCases.getWithContext(decisionCaseId);
      const assignment = reviewerAssignment(context);
      if (assignment?.reviewer_id && assignment.reviewer_id !== actorId) {
        const error = new Error('Review is assigned to another reviewer');
        error.name = 'ForbiddenError';
        throw error;
      }

      const assessmentId = typeof body.assessment_id === 'string' ? body.assessment_id : assignment?.assessment_id;
      if (assessmentId) {
        const assessment = await repositories.assessments.getById(assessmentId);
        if (!assessment || assessment.decision_case_id !== decisionCaseId) {
          throw new Error('assessment_id does not belong to the decision case');
        }
      }

      const existingReview = (await repositories.trustedReviews.getByDecisionCaseId(decisionCaseId))
        .find((review) => review.reviewer_id === actorId);
      if (existingReview) {
        response.status(409).json({ error: 'Review has already been submitted' });
        return;
      }

      const input: CreateTrustedReviewInput = {
        decision_case_id: decisionCaseId,
        assessment_id: assessmentId,
        reviewer_id: actorId,
        status,
        comment: typeof body.comment === 'string' ? body.comment : undefined,
      };
      const review = await repositories.trustedReviews.submitReview(input);
      await repositories.decisionCases.updateStatus(decisionCaseId, 'ready_for_decision');
      response.status(201).json(review);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases/:decisionCaseId/reviews', async (request, response) => {
    try {
      const caseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, caseId);
      const reviews = await repositories.trustedReviews.getByDecisionCaseId(caseId);
      const reviewsWithProfiles = await Promise.all(reviews.map(async (review) => ({
        ...review,
        reviewer: await repositories.profiles.getById(review.reviewer_id),
      })));
      response.json(reviewsWithProfiles);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-cases/:decisionCaseId/decision', async (request, response) => {
    try {
      const caseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, caseId);
      const record = await repositories.decisionRecords.getByDecisionCaseId(caseId);
      if (!record) {
        response.status(404).json({ error: 'Decision record not found' });
        return;
      }
      response.json(record);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-cases/:decisionCaseId/decision', async (request, response) => {
    try {
      const body = bodyOf(request);
      const decisionCaseId = requiredString(request.params.decisionCaseId, 'decisionCaseId');
      await ensureCaseAccess(request, decisionCaseId);
      const existing = await repositories.decisionRecords.getByDecisionCaseId(decisionCaseId);
      if (existing) {
        const sameDecision = existing.decided_by === currentProfileId(request)
          && existing.assessment_id === body.assessment_id
          && existing.decision_text === body.decision_text;
        if (sameDecision) {
          response.status(200).json(existing);
        } else {
          response.status(409).json({ error: 'Decision record already exists and is immutable' });
        }
        return;
      }
      const input: CreateDecisionRecordInput = {
        decision_case_id: decisionCaseId,
        decided_by: currentProfileId(request),
        assessment_id: requiredString(body.assessment_id, 'assessment_id'),
        selected_action_option_id: typeof body.selected_action_option_id === 'string' ? body.selected_action_option_id : undefined,
        decision_type: enumValue(body.decision_type, 'decision_type', decisionTypes),
        decision_text: requiredString(body.decision_text, 'decision_text'),
        reason: typeof body.reason === 'string' ? body.reason : undefined,
        authority: 'human',
        is_mock: body.is_mock === true,
        supersedes_record_id: typeof body.supersedes_record_id === 'string' ? body.supersedes_record_id : undefined,
        assessment_snapshot: typeof body.assessment_snapshot === 'object' && body.assessment_snapshot !== null
          ? body.assessment_snapshot as Record<string, unknown>
          : undefined,
        evidence_snapshot: typeof body.evidence_snapshot === 'object' && body.evidence_snapshot !== null
          ? body.evidence_snapshot as Record<string, unknown>
          : undefined,
      };
      const decision = await repositories.decisionRecords.createDecision(input);
      const evidenceIds = Array.isArray(body.evidence_ids)
        ? body.evidence_ids.filter((value): value is string => typeof value === 'string')
        : [];
      await repositories.decisionRecords.linkEvidence(decision.id, evidenceIds);
      await repositories.decisionCases.closeCase(decisionCaseId);
      response.status(201).json(decision);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-records', async (request, response) => {
    try {
      const decidedBy = currentProfileId(request);
      response.json(await repositories.decisionRecords.getByDecidedBy(decidedBy));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-records/:id/brief', async (request, response) => {
    try {
      const recordId = requiredString(request.params.id, 'id');
      const record = await repositories.decisionRecords.getById(recordId);
      if (!record) {
        response.status(404).json({ error: 'Decision record not found' });
        return;
      }
      await ensureCaseAccess(request, record.decision_case_id);
      const brief = await repositories.decisionBriefs.getByDecisionRecordId(recordId);
      if (!brief) {
        response.status(404).json({ error: 'Decision brief not found' });
        return;
      }
      response.json(brief);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-records/:id', async (request, response) => {
    try {
      const recordId = requiredString(request.params.id, 'id');
      const baseRecord = await repositories.decisionRecords.getById(recordId);
      if (!baseRecord) {
        response.status(404).json({ error: 'Decision record not found' });
        return;
      }
      await ensureCaseAccess(request, baseRecord.decision_case_id);
      const record = await repositories.decisionRecords.getWithContext(recordId);
      if (!record) {
        response.status(404).json({ error: 'Decision record not found' });
        return;
      }
      response.json(record);
    } catch (error) {
      sendError(response, error);
    }
  });

  router.post('/decision-records/:id/brief', async (request, response) => {
    try {
      const decisionRecordId = requiredString(request.params.id, 'id');
      const decisionRecord = await repositories.decisionRecords.getById(decisionRecordId);
      if (!decisionRecord) {
        response.status(404).json({ error: 'Decision record not found' });
        return;
      }
      await ensureCaseAccess(request, decisionRecord.decision_case_id);
      const decisionCase = await repositories.decisionCases.getById(decisionRecord.decision_case_id);
      if (!decisionCase) {
        response.status(404).json({ error: 'Decision case not found' });
        return;
      }
      const assessment = await repositories.assessments.getById(decisionRecord.assessment_id);
      const trustedReviews = await Promise.all((await repositories.trustedReviews.getByDecisionCaseId(decisionRecord.decision_case_id)).map(async (review) => ({
        reviewerName: (await repositories.profiles.getById(review.reviewer_id))?.display_name,
        status: review.status,
        comment: review.comment,
      })));
      const input: CreateDecisionBriefInput = {
        decision_record_id: decisionRecordId,
        template_version: 'decision-brief-v0.2',
        content: formatDecisionBrief({ decisionCase, decisionRecord, assessment, trustedReviews }),
      };
      response.status(201).json(await repositories.decisionBriefs.createBrief(input));
    } catch (error) {
      sendError(response, error);
    }
  });

  router.get('/decision-records/:id/share-text', async (request, response) => {
    try {
      const decisionRecordId = requiredString(request.params.id, 'id');
      const decisionRecord = await repositories.decisionRecords.getById(decisionRecordId);
      if (!decisionRecord) {
        response.status(404).json({ error: 'Decision record not found' });
        return;
      }
      await ensureCaseAccess(request, decisionRecord.decision_case_id);
      const decisionCase = await repositories.decisionCases.getById(decisionRecord.decision_case_id);
      if (!decisionCase) {
        response.status(404).json({ error: 'Decision case not found' });
        return;
      }
      const assessment = await repositories.assessments.getById(decisionRecord.assessment_id);
      const trustedReviews = await Promise.all((await repositories.trustedReviews.getByDecisionCaseId(decisionRecord.decision_case_id)).map(async (review) => ({
        reviewerName: (await repositories.profiles.getById(review.reviewer_id))?.display_name,
        status: review.status,
        comment: review.comment,
      })));
      response.json({ text: formatDecisionBrief({ decisionCase, decisionRecord, assessment, trustedReviews }) });
    } catch (error) {
      sendError(response, error);
    }
  });

  return router;
}
