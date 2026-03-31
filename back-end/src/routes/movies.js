import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

async function getCurrentUser(firebaseUid) {
  return prisma.user.findUnique({
    where: { firebaseUid },
  });
}

router.put('/:externalMovieId/status', requireAuth, async (req, res) => {
  const externalMovieId = Number(req.params.externalMovieId);
  const { status, title, releaseYear, apiRating } = req.body;


  if (!['NOT_WATCHED', 'WATCHING', 'WATCHED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

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

  const userStatus = await prisma.userMovieStatus.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: movie.id,
      },
    },
    update: { status },
    create: {
      userId: user.id,
      movieId: movie.id,
      status,
    },
  });

  res.json(userStatus);
});

router.get('/:externalMovieId/me', requireAuth, async (req, res) => {
  const externalMovieId = Number(req.params.externalMovieId);
  const user = await getCurrentUser(req.user.uid);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const movie = await prisma.movie.findUnique({
    where: { externalMovieId },
  });

  if (!movie) {
    return res.json({
      movie: null,
      rating: null,
      comment: null,
      status: null,
      watchlists: [],
    });
  }

  const [rating, comment, status, watchlists] = await Promise.all([
    prisma.rating.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: movie.id,
        },
      },
    }),
    prisma.personalComment.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: movie.id,
        },
      },
    }),
    prisma.userMovieStatus.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId: movie.id,
        },
      },
    }),
    prisma.watchlist.findMany({
      where: {
        userId: user.id,
        movies: {
          some: {
            movieId: movie.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  res.json({
    movie,
    rating,
    comment,
    status,
    watchlists,
  });
});

export default router;
