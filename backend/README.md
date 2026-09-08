# RembukTani Backend

## Authentication flow

Public endpoints:

- `POST /api/auth/register` — accepts `displayName`, `identity` (email or Indonesian WhatsApp number), `password`, and `role` (`farmer` or `reviewer`).
- `POST /api/auth/login` — accepts `identity` and `password`, then returns the Supabase access/refresh session and persisted RembukTani profile.
- `POST /api/auth/refresh` — exchanges a refresh token for a renewed session.

All other `/api/*` routes require `Authorization: Bearer <access-token>`. The service-role key stays in the backend only. Registration uses the anon client and creates the matching `profiles` row server-side; if profile creation fails, the newly-created auth user is rolled back.

Express 5 + TypeScript API for the RembukTani M2 decision-support vertical slice.

## Setup

1. Copy `.env.example` to `.env` or `.env.local`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Apply `migrations/001_init_rembuktani_schema.sql`, then `migrations/002_decision_record_audit_and_assessment_evidence.sql`, then `migrations/003_simplify_profile_roles.sql` in Supabase.
4. Install dependencies with `npm install`.

## Commands

```text
npm run dev          # start API with watch mode
npm run build        # TypeScript build
npm test             # BMKG and reasoning unit tests
npm run demo:seed    # create DEMO-WATER-01 data through Supabase Admin API
npm run demo:reset   # remove the configured demo auth user and cascaded data
npm run spike:location
```

The demo seed uses `DEMO_USER_EMAIL` and `DEMO_USER_PASSWORD` when provided. It marks fixture Field Pulse data with `is_mock=true` and `DEMO-WATER-01`; it never presents fixture data as live BMKG data.

## API

The API is mounted at `/api`. The machine-readable contract is [docs/openapi.yaml](docs/openapi.yaml). The implementation notes and examples are in [docs/TASK_4_2_API.md](docs/TASK_4_2_API.md).

## Authentication and authorization

Except `/api/health`, `/api/docs`, and `/api/openapi.yaml`, API requests require:

```text
Authorization: Bearer <Supabase Auth access token>
```

The backend validates the token with Supabase Auth, resolves the matching `profiles` row, and derives the acting profile from the token. Client-supplied `owner_id`, `created_by`, `decided_by`, and `reviewer_id` values are not trusted. Profiles are restricted to their own land and decision cases. Profiles with role `reviewer` may submit trusted reviews on any decision case.

The backend uses the service-role key only server-side. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend. The frontend should use Supabase Auth with the anon key, then send the access token to this API.

## Persistent BMKG cache

Live BMKG responses are stored in Supabase `external_source_cache` with `source_name=BMKG`, `request_key=<adm4>`, `request_uri`, `fetched_at`, and `expires_at`. When BMKG is unavailable, only a non-expired persisted cache entry is used and the API returns `delivery: cached`; no fixture is substituted as live data.

## Safety boundaries

- BMKG is external evidence, not local water-state evidence.
- Reasoning returns transparent alternatives only; it never creates a human decision.
- Decision Records require explicit human input and are immutable.
- Decision Brief content is deterministic and does not call an LLM.
- BIG location candidates are not silently converted into BMKG `adm4` values.
