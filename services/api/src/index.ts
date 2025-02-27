import express from 'express';
import cors from 'cors';
import authRoutes from './authRoutes';
import taskRoutes from './taskRoutes';
import userRoutes from './userRoutes';
import taskListRoutes from './taskListRoutes';
import passport from 'passport';
import { getConfig } from './lib/config';
import CookieParser from 'cookie-parser';
import morgan from 'morgan';
import './lib/passport-jwt-strategy';

const morganLogger = morgan('combined', {
  skip: function (req: any) {
    // ignore k8s probe route
    return req.url === '/probe';
  },
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ credentials: true, origin: `http://${getConfig().webAppHost}` }));

app.use(CookieParser());

app.use(morganLogger);

app.get('/probe', async (_, res) => {
  res.send('todoiti api');
});

app.use('/v1/auth', authRoutes);
app.use('/v1/users', passport.authenticate('jwt', { session: false }), userRoutes);
app.use('/v1/tasks', passport.authenticate('jwt', { session: false }), taskRoutes);
app.use('/v1/task-lists', passport.authenticate('jwt', { session: false }), taskListRoutes);

const config = getConfig();
app.listen(config.apiPort, () => {
  console.info('API running on port:', config.apiPort);
});
