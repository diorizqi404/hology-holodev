# Supabase Auth, RBAC, and BMKG Cache

## Auth flow

1. Frontend authenticates with Supabase Auth using the anon key.
2. Frontend sends the returned access token as `Authorization: Bearer <token>`.
3. Backend calls `supabase.auth.getUser(token)`.
4. Backend resolves `profiles.user_id` and attaches the profile to the request.
5. Route guards compare the authenticated profile with the land owner/case owner.

The service-role key is never sent to the browser. It is used only by the backend repository and persistent cache clients.

## Roles

| Role | Default access |
|---|---|
| `farmer` | Own lands, crop contexts, cases, evidence, decisions, and briefs; can request trusted review |
| `reviewer` | Can submit approve/reject on decision-case reviews (does not need to own the land) |

The current authorization boundary is ownership for farmer resources, plus the `reviewer` role for submitting trusted reviews. Apply migration `003_simplify_profile_roles.sql` after `001` and `002`.

## BMKG cache

The production adapter uses `SupabaseBmkgCache` backed by `external_source_cache`. The in-memory `BmkgCache` remains available for isolated unit tests. Cache lookup requires `source_name=BMKG`, matching `request_key`/`adm4`, `status=success`, and `expires_at` in the future.

Apply migrations `001`, `002`, then `003` before starting the API.