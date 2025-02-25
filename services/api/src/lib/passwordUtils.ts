import argon2 from 'argon2';

export const getPasswordHash = (password: string): Promise<string> => {
  try {
    return argon2.hash(password);
  } catch (error: any) {
    console.error(`Failed to hash password ${error?.message}`);
    throw new Error('Failed to hash password');
  }
};

export const validatePassword = (dbPassword: string, password: string): Promise<boolean> => {
  try {
    return argon2.verify(dbPassword, password);
  } catch (error: any) {
    console.error(`Failed to verify password ${error?.message}`);
    throw new Error('Failed to verify password');
  }
};
