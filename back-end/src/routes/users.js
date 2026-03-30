import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/sync', requireAuth, async (req, res) => {
  const firebaseUid = req.user.uid;
  const email = req.user.email;

  if (!email) {
    return res.status(400).json({ error: 'Firebase account has no email' });
  }

  const existingUser = await prisma.user.findUnique({
    where: { firebaseUid },
  });

  if (existingUser) {
    return res.json(existingUser);
  }

  const createdUser = await prisma.user.create({
    data: {
      firebaseUid,
      email,
      username: email.split('@')[0],
    },
  });

  return res.status(201).json(createdUser);
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { firebaseUid: req.user.uid },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

export default router;
