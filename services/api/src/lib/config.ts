import env from 'env-var';

export const getConfig = () => ({
  jwtSecret: env.get('JWT_SECRET').required().asString(),
  jwtAccessCookieName: env.get('JWT_ACCESS_COOKIE_NAME').required().asString(),
  jwtAccessSecret: env.get('JWT_ACCESS_SECRET').required().asString(),
  jwtAccessTTL: env.get('JWT_ACCESS_TTL').required().asIntPositive(),
  apiHost: env.get('HOST').default('0.0.0.0').asString(),
  apiPort: env.get('PORT').default(8000).asIntPositive(),
});
