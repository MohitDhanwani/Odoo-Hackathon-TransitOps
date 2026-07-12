import { Request, Response } from 'express';
import { db } from '../../config/db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';
import { successResponse } from '../../utils/apiResponse';
import { catchAsync } from '../../utils/catchAsync';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new ApiError(403, `Account locked, try again after ${new Date(user.lockedUntil).toLocaleString()}`);
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    const newAttempts = user.failedLoginAttempts + 1;
    let lockedUntil = null;

    if (newAttempts >= env.LOGIN_MAX_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + env.LOGIN_LOCK_MINUTES * 60 * 1000);
    }

    await db.update(users).set({
      failedLoginAttempts: newAttempts,
      lockedUntil: lockedUntil,
    }).where(eq(users.id, user.id));

    throw new ApiError(401, 'Invalid credentials');
  }

  await db.update(users).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
  }).where(eq(users.id, user.id));

  const token = signToken({ userId: user.id, role: user.role });

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json(successResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie(env.COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
  });

  return res.json(successResponse({ message: 'Logged out successfully' }));
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  
  const [user] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role
  }).from(users).where(eq(users.id, userId));

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.json(successResponse(user));
});
