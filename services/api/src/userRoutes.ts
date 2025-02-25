import { Router } from 'express';

const router = Router();

router.get('/whoami', async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;
