import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

async function getCurrentUser(firebaseUid) {
  return prisma.user.findUnique({
    where: { firebaseUid },
  });
}

router.get('/', async (req, res) => {
  const polls = await prisma.poll.findMany({
    include: {
      options: {
        include: {
          votes: true,
        },
      },
      votes: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = polls
    .map((poll) => ({
      id: poll.id,
      question: poll.question,
      createdBy: poll.user.username || poll.user.email,
      totalVotes: poll.votes.length,
      options: poll.options.map((option) => ({
        id: option.id,
        text: option.text,
        votes: option.votes.length,
      })),
      createdAt: poll.createdAt,
    }))
    .sort((a, b) => b.totalVotes - a.totalVotes);

  res.json(formatted);
});

router.post('/', requireAuth, async (req, res) => {
  const { question, options } = req.body;
  const user = await getCurrentUser(req.user.uid);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!question || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'Question and 2 options are required' });
  }

  const poll = await prisma.poll.create({
    data: {
      userId: user.id,
      question,
      options: {
        create: options.map((text) => ({ text })),
      },
    },
    include: {
      options: true,
    },
  });

  res.status(201).json(poll);
});

router.post('/:pollId/vote', requireAuth, async (req, res) => {
  const pollId = Number(req.params.pollId);
  const { pollOptionId } = req.body;

  const user = await getCurrentUser(req.user.uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existingVote = await prisma.pollVote.findUnique({
    where: {
      userId_pollId: {
        userId: user.id,
        pollId,
      },
    },
  });

  if (existingVote) {
    return res.status(409).json({ error: 'User already voted on this poll' });
  }

  const vote = await prisma.pollVote.create({
    data: {
      userId: user.id,
      pollId,
      pollOptionId,
    },
  });

  res.status(201).json(vote);
});

export default router;
