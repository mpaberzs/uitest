import { ExtractJwt, Strategy } from 'passport-jwt';
import passport from 'passport';
import { getConfig } from './config';
import { getAuthUserById } from './models/userModel';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getConfig().jwtSecret,
};

passport.use(
  new Strategy(opts, async (payload, done) => {
    try {
      const user = await getAuthUserById(payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
