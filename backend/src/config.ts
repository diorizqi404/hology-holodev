import 'dotenv/config';

const requiredEnvironment = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 3000),
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:8443,http://127.0.0.1:8443')
    .split(',')
    .map((origin) => origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/$/, ''))
    .filter(Boolean),
  isProduction: process.env.NODE_ENV === 'production',
  bmkgCacheTtlMinutes: Number(process.env.BMKG_CACHE_TTL_MINUTES ?? 120),
  supabaseUrl: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  email: process.env.email,
  password: process.env.password,
  llmApiKey: process.env.GEMINI_API_KEY,
  llmModel: process.env.LLM_MODEL?.trim() || 'gemini-3.5-flash',
  llmEnabled: process.env.LLM_ENABLED !== 'false' && Boolean(process.env.GEMINI_API_KEY),
};
