import { Router } from 'express';

const router = Router();

router.get('/whoami', async (req, res) => {
  res.json(req.user);
});

export default router;
