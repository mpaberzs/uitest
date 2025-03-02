import { Router } from 'express';
import { getUserById } from './lib/models/userModel';

const router = Router();

router.get('/whoami', async (req, res) => {
  try {
    const user = await getUserById((req.user as any).id);
    res.json(user);
  } catch (error) {
    res.status(500).json({message: 'Something went wrong fetching user data'})
  }
});

export default router;
