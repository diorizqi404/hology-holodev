import cors from 'cors';
import 'dotenv/config.js';
import express from 'express';
import rateLimit from "express-rate-limit"
import path from 'node:path';
import { config } from './config.js';
import { createRepositoryFactory } from './domain/repositories/factory.js';
import { supabase } from './infrastructure/persistence/supabase.js';
import { SupabaseBmkgCache } from './infrastructure/cache/supabase-bmkg-cache.js';
import { BmkgAdapter } from './infrastructure/bmkg/bmkg-adapter.js';
import { requireAuth } from './shared/auth.js';
import { createApiRouter } from './routes/api.js';
import { createAuthRouter } from './routes/auth.js';

const app = express();
const authLandingOrigin = config.clientOrigins.find((origin) => origin === 'http://127.0.0.1:5173')
  ?? config.clientOrigins[0];

app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // A single evidence-to-decision flow legitimately performs many authenticated
    // reads/writes. Keep the global abuse guard high enough that normal PWA use and
    // QA do not lock the entire API; auth endpoints retain Supabase's own limits.
    limit: 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);

// Supabase currently uses the backend root as its Site URL. This tiny browser-side
// bridge is intentional: URL fragments (where Supabase puts recovery tokens) are
// never sent to the server and would be lost by a normal HTTP redirect.
app.get('/', (_request, response) => {
  const clientOrigin = JSON.stringify(authLandingOrigin);
  response
    .status(200)
    .set({
      'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
    })
    .type('html')
    .send(`<!doctype html>
<html lang="id">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RembukTani</title></head>
  <body>
    <p>Mengarahkan ke aplikasi RembukTani...</p>
    <script>
      (() => {
        const clientOrigin = ${clientOrigin};
        const hash = window.location.hash || '';
        const query = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
        const isRecovery = query.get('type') === 'recovery' || hashParams.get('type') === 'recovery' || hashParams.has('access_token');
        const destination = isRecovery ? '/reset-password' : '/login?verified=1';
        window.location.replace(clientOrigin + destination + (isRecovery ? window.location.search + hash : ''));
      })();
    </script>
  </body>
</html>`);
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/docs', (_request, response) => {
  response.json({
    title: 'RembukTani M2 API',
    openapi: '/api/openapi.yaml',
    description: 'Authenticated API for land, evidence, assessment, review, human decision, and deterministic brief workflows.',
  });
});
app.get('/api/openapi.yaml', (_request, response) => {
  response.sendFile(path.resolve(process.cwd(), 'docs', 'openapi.yaml'));
});

app.use('/api/auth', createAuthRouter(supabase));

app.use(
  '/api',
  requireAuth(supabase),
  createApiRouter(createRepositoryFactory(supabase), {
    bmkgAdapter: new BmkgAdapter(undefined, new SupabaseBmkgCache(supabase, config.bmkgCacheTtlMinutes)),
  }),
);

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});

export default app;
