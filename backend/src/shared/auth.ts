import type { NextFunction, Request, Response } from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Profile } from '../domain/types.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user: User;
        profile: Profile;
      };
    }
  }
}

const bearerToken = (request: Request): string | null => {
  const value = request.header('authorization');
  if (!value?.startsWith('Bearer ')) return null;
  const token = value.slice('Bearer '.length).trim();
  return token || null;
};

export const requireAuth = (supabase: SupabaseClient) => async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  const token = bearerToken(request);
  if (!token) {
    response.status(401).json({ error: 'Missing Bearer token' });
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    response.status(401).json({ error: 'Invalid or expired access token' });
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .single();

  if (profileError || !profile) {
    response.status(403).json({ error: 'Authenticated user has no RembukTani profile' });
    return;
  }

  request.auth = { user: userData.user, profile: profile as Profile };
  next();
};

export const requireRoles = (...roles: Profile['role'][]) => (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  if (!request.auth || !roles.includes(request.auth.profile.role)) {
    response.status(403).json({ error: 'Insufficient role for this operation' });
    return;
  }
  next();
};

export const currentProfileId = (request: Request): string => {
  const profileId = request.auth?.profile.id;
  if (!profileId) throw new Error('Authenticated profile is required');
  return profileId;
};

export const assertProfileAccess = (request: Request, profileId: string): void => {
  if (currentProfileId(request) !== profileId) {
    const error = new Error('Profile access denied');
    error.name = 'ForbiddenError';
    throw error;
  }
};
