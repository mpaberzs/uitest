import env from 'env-var';

export const getConfig = () => ({
  jwtSecret: env.get('JWT_SECRET').required().asString(),
  apiPort: env.get('PORT').default(8000).asIntPositive(),
});
