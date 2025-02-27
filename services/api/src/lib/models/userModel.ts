import database from '../database';
import { sql, UniqueIntegrityConstraintViolationError } from 'slonik';
import { v4 as uuidv4, v4 } from 'uuid';
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
import {
  UserByEmailAlreadyRegistered,
  UserNotFoundByEmail,
  UserPasswordIncorrect,
  UserTokenIdAlreadyExists,
} from '../exceptions';

export const deactivateUserTokens = async (userId: string) => {
  const connection = await database();

  return connection.query(
    sql.unsafe`UPDATE user_auth_tokens SET valid = false WHERE user_id = ${userId}`
  );
};

export const getUserToken = async (tokenId: string) => {
  const connection = await database();

  return connection.one(
    sql.unsafe`SELECT user_id, token_id, valid FROM user_auth_tokens WHERE token_id = ${tokenId}`
  );
};

export const createUserToken = async (userId: string) => {
  const tokenId = v4();

  const connection = await database();

  try {
    await connection.query(
      sql.unsafe`INSERT INTO user_auth_tokens (user_id, token_id, valid) SELECT * FROM ${sql.unnest(
        [[userId, tokenId, true]],
        ['uuid', 'uuid', 'bool']
      )}`
    );
  } catch (error) {
    if (error instanceof UniqueIntegrityConstraintViolationError) {
      throw new UserTokenIdAlreadyExists('tokenId conflict');
    } else {
      throw error;
    }
  }

  return tokenId;
};

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
