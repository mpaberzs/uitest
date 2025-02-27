import env from 'env-var';

export const getConfig = () => ({
  jwtRefreshSecret: env.get('JWT_REFRESH_SECRET').required().asString(),
  jwtRefreshCookieName: env.get('JWT_REFRESH_COOKIE_NAME').required().asString(),
  jwtRefreshTTL: env.get('JWT_REFRESH_TTL').required().asIntPositive(),
  jwtAccessSecret: env.get('JWT_ACCESS_SECRET').required().asString(),
  jwtAccessTTL: env.get('JWT_ACCESS_TTL').required().asIntPositive(),
  webAppHost: env.get('WEBAPP_HOST').required().asString(),
  apiHost: env.get('API_HOST').default('0.0.0.0').asString(),
  apiPort: env.get('API_PORT').default(8000).asIntPositive(),
});
