import { Router } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { createAnonClient } from '../infrastructure/persistence/supabase.js';

type AccountRole = 'farmer' | 'reviewer';

export const normalizeIdentity = (value: unknown): { email?: string; phone?: string } => {
  const identity = typeof value === 'string' ? value.trim() : '';
  if (!identity) throw new Error('Nomor WhatsApp atau email wajib diisi');
  if (identity.includes('@')) {
    const email = identity.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email tidak valid');
    return { email };
  }

  if (!/^\+?[\d\s().-]+$/.test(identity)) throw new Error('Nomor WhatsApp tidak valid');
  const digits = identity.replace(/\D/g, '');
  const phone = identity.startsWith('+')
    ? `+${digits}`
    : digits.startsWith('62')
      ? `+${digits}`
      : digits.startsWith('0')
        ? `+62${digits.slice(1)}`
        : digits.startsWith('8')
          ? `+62${digits}`
          : `+${digits}`;
  if (!/^\+[1-9]\d{8,14}$/.test(phone)) throw new Error('Nomor WhatsApp tidak valid');
  return { phone };
};

const publicSession = (session: { access_token: string; refresh_token: string; expires_at?: number; expires_in: number; token_type: string }) => ({
  accessToken: session.access_token,
  refreshToken: session.refresh_token,
  expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
  tokenType: session.token_type,
});

const messageFor = (error: unknown): string => error instanceof Error ? error.message : 'Permintaan autentikasi gagal';
const isNetworkAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { name?: string; status?: number };
  return candidate.name === 'AuthRetryableFetchError' || candidate.status === 0 || (candidate.status ?? 0) >= 500;
};
const isEmailRateLimitError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { code?: string; status?: number };
  return candidate.status === 429 && candidate.code === 'over_email_send_rate_limit';
};
const emailRateLimitMessage = 'Batas pengiriman email tercapai. Tunggu hingga satu jam, lalu coba lagi.';
const isPhoneProviderError = (error: unknown): boolean => {
  const message = messageFor(error).toLowerCase();
  return message.includes('phone provider') || message.includes('sms provider') || message.includes('unsupported phone') || message.includes('phone signup') || message.includes('phone signups');
};
const phoneProviderMessage = 'Pendaftaran nomor belum aktif pada Supabase. Aktifkan Phone Auth dan hubungkan Twilio WhatsApp terlebih dahulu.';

export const createAuthRouter = (serviceClient: SupabaseClient): Router => {
  const router = Router();

  router.post('/register', async (request, response) => {
    try {
      const displayName = typeof request.body?.displayName === 'string' ? request.body.displayName.trim() : '';
      const password = typeof request.body?.password === 'string' ? request.body.password : '';
      const role: AccountRole = request.body?.role === 'reviewer' ? 'reviewer' : 'farmer';
      if (displayName.length < 2) throw new Error('Nama lengkap minimal 2 karakter');
      if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter');

      const identity = normalizeIdentity(request.body?.identity);
      const anonClient = createAnonClient();
      const requestOrigin = typeof request.headers.origin === 'string'
        ? request.headers.origin.replace(/\/$/, '')
        : '';
      const clientOrigin = config.clientOrigins.includes(requestOrigin)
        ? requestOrigin
        : config.clientOrigins[0];
      const credentials = identity.email
        ? {
            email: identity.email,
            password,
            options: {
              data: { display_name: displayName, role },
              emailRedirectTo: `${clientOrigin}/login?verified=1`,
            },
          }
        : { phone: identity.phone!, password, options: { data: { display_name: displayName, role }, channel: 'whatsapp' as const } };
      const { data, error } = await anonClient.auth.signUp(credentials);
      if (error) {
        if (isNetworkAuthError(error)) return void response.status(503).json({ error: 'Layanan autentikasi sedang tidak dapat dijangkau' });
        if (isEmailRateLimitError(error)) return void response.status(429).json({ error: emailRateLimitMessage });
        if (isPhoneProviderError(error)) return void response.status(503).json({ error: phoneProviderMessage });
        return void response.status(400).json({ error: error.message });
      }
      if (!data.user || data.user.identities?.length === 0) return void response.status(409).json({ error: 'Akun sudah terdaftar' });

      const { error: profileError } = await serviceClient.from('profiles').upsert({
        user_id: data.user.id,
        display_name: displayName,
        role,
      }, { onConflict: 'user_id' });
      if (profileError) {
        await serviceClient.auth.admin.deleteUser(data.user.id);
        throw new Error('Profil akun gagal dibuat');
      }

      response.status(201).json({
        user: { id: data.user.id, displayName, role },
        session: data.session ? publicSession(data.session) : null,
        requiresVerification: !data.session,
        verificationChannel: identity.phone ? 'whatsapp' : 'email',
        verificationTarget: identity.phone ?? identity.email,
      });
    } catch (error) {
      response.status(400).json({ error: messageFor(error) });
    }
  });

  router.post('/login', async (request, response) => {
    try {
      const password = typeof request.body?.password === 'string' ? request.body.password : '';
      if (!password) throw new Error('Kata sandi wajib diisi');
      const anonClient = createAnonClient();
      const identity = normalizeIdentity(request.body?.identity);
      const credentials = identity.email ? { email: identity.email, password } : { phone: identity.phone!, password };
      const { data, error } = await anonClient.auth.signInWithPassword(credentials);
      if (error) return void response.status(isNetworkAuthError(error) ? 503 : 401).json({ error: isNetworkAuthError(error) ? 'Layanan autentikasi sedang tidak dapat dijangkau' : 'Nomor WhatsApp/email atau kata sandi salah' });
      if (!data.session) return void response.status(401).json({ error: 'Nomor WhatsApp/email atau kata sandi salah' });
      const { data: profile } = await serviceClient.from('profiles').select('*').eq('user_id', data.user.id).single();
      if (!profile) return void response.status(403).json({ error: 'Akun belum memiliki profil RembukTani' });
      response.json({ user: profile, session: publicSession(data.session) });
    } catch (error) {
      response.status(400).json({ error: messageFor(error) });
    }
  });

  router.post('/refresh', async (request, response) => {
    const refreshToken = typeof request.body?.refreshToken === 'string' ? request.body.refreshToken : '';
    if (!refreshToken) return void response.status(400).json({ error: 'Refresh token wajib diisi' });
    const { data, error } = await createAnonClient().auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) return void response.status(isNetworkAuthError(error) ? 503 : 401).json({ error: isNetworkAuthError(error) ? 'Layanan autentikasi sedang tidak dapat dijangkau' : 'Sesi tidak dapat diperbarui' });
    response.json({ session: publicSession(data.session) });
  });

  router.post('/verify-phone', async (request, response) => {
    try {
      const identity = normalizeIdentity(request.body?.phone);
      if (!identity.phone) return void response.status(400).json({ error: 'Nomor WhatsApp tidak valid' });
      const token = typeof request.body?.token === 'string' ? request.body.token.replace(/\D/g, '') : '';
      if (!/^\d{6}$/.test(token)) return void response.status(400).json({ error: 'Kode verifikasi harus terdiri dari 6 angka' });
      const { data, error } = await createAnonClient().auth.verifyOtp({ phone: identity.phone, token, type: 'sms' });
      if (error || !data.session || !data.user) {
        if (isNetworkAuthError(error)) return void response.status(503).json({ error: 'Layanan autentikasi sedang tidak dapat dijangkau' });
        return void response.status(400).json({ error: 'Kode verifikasi salah atau sudah kedaluwarsa' });
      }
      const { data: profile } = await serviceClient.from('profiles').select('*').eq('user_id', data.user.id).single();
      if (!profile) return void response.status(403).json({ error: 'Akun belum memiliki profil RembukTani' });
      response.json({ user: profile, session: publicSession(data.session) });
    } catch (error) {
      response.status(400).json({ error: messageFor(error) });
    }
  });

  router.post('/resend-phone-verification', async (request, response) => {
    try {
      const identity = normalizeIdentity(request.body?.phone);
      if (!identity.phone) return void response.status(400).json({ error: 'Nomor WhatsApp tidak valid' });
      const { error } = await createAnonClient().auth.signInWithOtp({
        phone: identity.phone,
        options: { channel: 'whatsapp', shouldCreateUser: false },
      });
      if (error) {
        if (isNetworkAuthError(error)) return void response.status(503).json({ error: 'Layanan autentikasi sedang tidak dapat dijangkau' });
        if (isPhoneProviderError(error)) return void response.status(503).json({ error: phoneProviderMessage });
        return void response.status(error.status === 429 ? 429 : 400).json({ error: error.status === 429 ? 'Terlalu banyak permintaan kode. Tunggu sebentar lalu coba lagi.' : error.message });
      }
      response.json({ message: 'Kode verifikasi baru telah dikirim melalui WhatsApp.' });
    } catch (error) {
      response.status(400).json({ error: messageFor(error) });
    }
  });

  router.post('/logout', async (request, response) => {
    const authorization = typeof request.headers.authorization === 'string' ? request.headers.authorization : '';
    const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    if (!accessToken) return void response.status(400).json({ error: 'Access token wajib diisi' });

    try {
      const { error } = await serviceClient.auth.admin.signOut(accessToken, 'local');
      // Logout is idempotent: an expired/already-revoked token is already signed out.
      if (error && error.status !== 401) {
        return void response.status(isNetworkAuthError(error) ? 503 : 400).json({ error: messageFor(error) });
      }
      response.status(204).send();
    } catch (error) {
      response.status(isNetworkAuthError(error) ? 503 : 400).json({ error: messageFor(error) });
    }
  });

  router.post('/forgot-password', async (request, response) => {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    if (!email || !email.includes('@')) return void response.status(400).json({ error: 'Email tidak valid' });
    const requestOrigin = typeof request.headers.origin === 'string' ? request.headers.origin.replace(/\/$/, '') : '';
    const clientOrigin = config.clientOrigins.includes(requestOrigin) ? requestOrigin : config.clientOrigins[0];
    const { error } = await createAnonClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${clientOrigin}/reset-password`,
    });
    if (error && isNetworkAuthError(error)) {
      return void response.status(503).json({ error: 'Layanan autentikasi sedang tidak dapat dijangkau' });
    }
    if (isEmailRateLimitError(error)) {
      return void response.status(429).json({ error: emailRateLimitMessage });
    }
    if (error) {
      console.error('Supabase password recovery failed', {
        code: error.code,
        message: error.message,
        status: error.status,
      });
    }
    // Deliberately return the same response for existing and unknown accounts.
    response.json({ message: 'Jika email terdaftar, tautan reset telah dikirim.' });
  });

  router.post('/reset-password', async (request, response) => {
    const accessToken = typeof request.body?.accessToken === 'string' ? request.body.accessToken : '';
    const password = typeof request.body?.password === 'string' ? request.body.password : '';
    if (!accessToken) return void response.status(400).json({ error: 'Tautan reset tidak valid atau sudah kedaluwarsa' });
    if (password.length < 8) return void response.status(400).json({ error: 'Kata sandi minimal 8 karakter' });
    const { data, error } = await serviceClient.auth.getUser(accessToken);
    if (error || !data.user) return void response.status(401).json({ error: 'Tautan reset tidak valid atau sudah kedaluwarsa' });
    const { error: updateError } = await serviceClient.auth.admin.updateUserById(data.user.id, { password });
    if (updateError) return void response.status(400).json({ error: updateError.message });
    response.json({ message: 'Kata sandi berhasil diperbarui.' });
  });

  return router;
};
