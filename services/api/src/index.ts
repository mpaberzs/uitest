import express from 'express';
import cors from 'cors';
import authRoutes from './authRoutes';
import taskRoutes from './taskRoutes';
import userRoutes from './userRoutes';
import taskListRoutes from './taskListRoutes';
import passport from 'passport';
import { getConfig } from './lib/config';
import CookieParser from 'cookie-parser';
import './lib/passport';

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(CookieParser());

app.get('/probe', async (req, res) => {
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
