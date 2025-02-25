import database from '../database';
import { sql, UniqueIntegrityConstraintViolationError } from 'slonik';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  userSchema,
  CreateUser,
  UpdateUser,
  AuthUser,
  UserLogin,
  authUserSchema,
} from '@todoiti/common';
import { getPasswordHash, validatePassword } from '../passwordUtils';
import z from 'zod';
import { UserByEmailAlreadyRegistered, UserNotFoundByEmail, UserPasswordIncorrect } from '../exceptions';

export const getUserByEmailAndPassword = async (payload: UserLogin): Promise<AuthUser> => {
  const connection = await database();

  const user = await connection.one(
    sql.type(
      authUserSchema.extend({ password: z.any() })
    )`SELECT id, email, password FROM users WHERE email = ${payload.email} LIMIT 1`
  );

  if (user) {
    const isPasswordValid = await validatePassword(user.password, payload.password);
    if (isPasswordValid) return { id: user.id, email: user.email };
    throw new UserPasswordIncorrect('incorrect password');
  } else {
    throw new UserNotFoundByEmail('user not found by email');
  }
};

export const getAuthUserById = async (id: string): Promise<AuthUser> => {
  const connection = await database();

  return connection.one(sql.type(userSchema)`SELECT id, email FROM users WHERE id = ${id}`);
};

export const getUserById = async (id: string): Promise<User> => {
  const connection = await database();

  return connection.one(
    sql.type(
      userSchema
    )`SELECT id, email, first_name, last_name, created_at, updated_at FROM users WHERE id = ${id}`
  );
};

export const createUser = async (payload: CreateUser): Promise<string> => {
  const connection = await database();
  const id = uuidv4();

  const password = await getPasswordHash(payload.password);

  try {
  await connection.query(
    sql.unsafe`INSERT INTO users (id, email, password) SELECT * FROM ${sql.unnest(
      [[id, payload.email, password]],
      ['uuid', 'text', 'text']
    )}`
  );
  } catch (error) {
    if (error instanceof UniqueIntegrityConstraintViolationError) {
      throw new UserByEmailAlreadyRegistered('email already taken');
    } else {
      throw error;
    }
  }

  return id;
};

export const updateUser = async (id: string, payload: UpdateUser): Promise<void> => {
  // TODO: implement
};
