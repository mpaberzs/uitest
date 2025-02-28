import { Router } from 'express';
import z from 'zod';
import {
  createUser,
  createUserToken,
  deactivateUserTokens,
  getUserByEmailAndPassword as getUserByEmailAndPassword,
  getUserToken,
} from './lib/models/userModel';
import { createUserSchema, userLoginSchema } from '@todoiti/common';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { getConfig } from './lib/config';
import {
  UserByEmailAlreadyRegistered,
  UserNotFoundByEmail,
  UserPasswordIncorrect,
} from './lib/exceptions';
import { v4 } from 'uuid';
import { NotFoundError } from 'slonik';
import passport from 'passport';

const router = Router();

router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    await deactivateUserTokens((req.user as any).id);

    res.clearCookie(getConfig().jwtRefreshCookieName, {
      httpOnly: true,
      maxAge: 5_000, // 5s
      // domain: getConfig().webAppHost
    });
    res.status(200).json({
      message: 'logout successful',
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong while logging out' });
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const id = await createUser(payload);

    res.status(201).json({
      id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else if (error instanceof UserByEmailAlreadyRegistered) {
      res.status(409).json({ message: 'Email already taken' });
    } else {
      res.status(500).json({ message: 'Something went wrong while registering new user' });
    }
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = userLoginSchema.parse(req.body);
    const user = await getUserByEmailAndPassword(payload);

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      getConfig().jwtAccessSecret,
      { expiresIn: getConfig().jwtAccessTTL, jwtid: v4() }
    );

    const token_id = await createUserToken(user.id);

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      getConfig().jwtRefreshSecret,
      { expiresIn: getConfig().jwtRefreshTTL, jwtid: token_id }
    );

    res.cookie(getConfig().jwtRefreshCookieName, refreshToken, {
      httpOnly: true,
      maxAge: getConfig().jwtRefreshTTL * 1000,
      // domain: getConfig().webAppHost
    });
    res.status(200).json({ message: 'login successful', user: { id: user.id }, accessToken });
  } catch (error: any) {
    console.error(`Error while logging in: ${error?.message}`);
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else if (error instanceof UserNotFoundByEmail) {
      res.status(404).json({ message: 'user not found' });
    } else if (error instanceof UserPasswordIncorrect) {
      res.status(401).json({ message: 'incorrect password' });
    } else {
      res.status(500).json({ message: 'Something went wrong while logging in' });
    }
  }
});

router.get('/refresh', async (req, res, next) => {
  try {
    const cookie = req.cookies[getConfig().jwtRefreshCookieName];
    if (!cookie) {
      res.status(401).json({ message: 'Missing refresh auth token' });
      return;
    }
    const verified = jwt.verify(cookie, getConfig().jwtRefreshSecret) as JwtPayload;
    console.log('ver', verified);
    console.log('decoe', jwt.decode(cookie));

    const tokenFromDatabase = await getUserToken(verified.jti!);
    if (tokenFromDatabase.valid) {
      const accessToken = jwt.sign(
        {
          id: tokenFromDatabase.user_id,
        },
        getConfig().jwtAccessSecret,
        { expiresIn: getConfig().jwtAccessTTL, jwtid: v4() }
      );

      res.status(200).json({ message: 'refresh successful', accessToken });
    } else {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error: any) {
    console.error(`Error happened refreshing token:`, error?.message);
    if (error instanceof NotFoundError) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    } else if (error instanceof JsonWebTokenError || error instanceof JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
    } else {
      res.status(500).json({ message: 'Something went wront while refreshing token' });
    }
  }
});

export default router;
