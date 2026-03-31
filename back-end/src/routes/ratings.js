import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

async function getCurrentUser(firebaseUid) {
  return prisma.user.findUnique({
    where: { firebaseUid },
  });
}

router.get('/', requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const ratings = await prisma.rating.findMany({
    where: { userId: user.id },
    include: {
      movie: true,
    },
    orderBy: { updatedAt: 'asc' },
  });

  res.json(ratings);
});

router.put('/:externalMovieId', requireAuth, async (req, res) => {
  const externalMovieId = Number(req.params.externalMovieId);
  const { score, title, releaseYear, apiRating } = req.body;


  const user = await getCurrentUser(req.user.uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!Number.isInteger(score) || score < 1 || score > 10) {
    return res.status(400).json({ error: 'Score must be 1 to 10' });
  }

  const movie = await prisma.movie.upsert({
    where: { externalMovieId },
    update: {
      title,
      releaseYear: releaseYear ?? null,
      apiRating: apiRating ?? null,
    },
    create: {
      externalMovieId,
      title,
      releaseYear: releaseYear ?? null,
      apiRating: apiRating ?? null,
    },
  });

  const rating = await prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: movie.id,
      },
    },
    update: { score },
    create: {
      userId: user.id,
      movieId: movie.id,
      score,
    },
  });

  res.json(rating);
});

router.put('/:externalMovieId/comment', requireAuth, async (req, res) => {
  const externalMovieId = Number(req.params.externalMovieId);
  const { content, title, releaseYear, apiRating } = req.body;


  const user = await getCurrentUser(req.user.uid);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const movie = await prisma.movie.upsert({
    where: { externalMovieId },
    update: {
      title,
      releaseYear: releaseYear ?? null,
      apiRating: apiRating ?? null,
    },
    create: {
      externalMovieId,
      title,
      releaseYear: releaseYear ?? null,
      apiRating: apiRating ?? null,
    },
  });

  const comment = await prisma.personalComment.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: movie.id,
      },
    },
    update: { content },
    create: {
      userId: user.id,
      movieId: movie.id,
      content,
    },
  });

  res.json(comment);
});

export default router;
