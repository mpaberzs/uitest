import { Router } from 'express';
import z from 'zod';
import {
  createUser,
  getUserByEmailAndPassword as getUserByEmailAndPassword,
} from './lib/models/userModel';
import { createUserSchema, userLoginSchema } from '@todoiti/common';
import jwt from 'jsonwebtoken';
import { getConfig } from './lib/config';
import {
  UserByEmailAlreadyRegistered,
  UserNotFoundByEmail,
  UserPasswordIncorrect,
} from './lib/exceptions';

const router = Router();

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
      { expiresIn: getConfig().jwtAccessTTL }
    );

    res.cookie(getConfig().jwtAccessCookieName, accessToken, {httpOnly: true, maxAge: getConfig().jwtAccessTTL * 1000});
    res.status(200).json({ message: 'user logged in', accessToken: accessToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else if (error instanceof UserNotFoundByEmail) {
      res.status(404).json({ message: 'user not found' });
    } else if (error instanceof UserPasswordIncorrect) {
      res.status(401).json({ message: 'incorrect password' });
    } else {
      throw error;
    }
  }
});

export default router;
