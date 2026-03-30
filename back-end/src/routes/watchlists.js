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
  try {
    const user = await getCurrentUser(req.user.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const watchlists = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        movies: {
          include: {
            movie: {
              include: {
                userStatuses: {
                  where: { userId: user.id },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = watchlists.map((watchlist) => {
      const totalMovies = watchlist.movies.length;
      const statuses = watchlist.movies.map(
        (item) => item.movie.userStatuses[0]?.status || 'NOT_WATCHED'
      );

      const completedMovies = statuses.filter((status) => status === 'WATCHED').length;
      const hasWatching = statuses.some((status) => status === 'WATCHING');

      let borderStatus = 'RED';

      if (totalMovies > 0 && completedMovies === totalMovies) {
        borderStatus = 'GREEN';
      } else if (hasWatching || completedMovies > 0) {
        borderStatus = 'YELLOW';
      }

      return {
        id: watchlist.id,
        name: watchlist.name,
        createdAt: watchlist.createdAt,
        updatedAt: watchlist.updatedAt,
        totalMovies,
        completedMovies,
        progressPercent:
          totalMovies === 0 ? 0 : Math.round((completedMovies / totalMovies) * 100),
        borderStatus,
        movies: watchlist.movies.map((item) => ({
          id: item.id,
          addedAt: item.addedAt,
          movie: item.movie,
        })),
      };
    });

    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch watchlists' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await getCurrentUser(req.user.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Watchlist name is required' });
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        userId: user.id,
        name: name.trim(),
      },
    });

    return res.status(201).json(watchlist);
  } catch (error) {
    return res.status(409).json({ error: 'Watchlist with this name already exists' });
  }
});

router.post('/:watchlistId/movies', requireAuth, async (req, res) => {
  try {
    const watchlistId = Number(req.params.watchlistId);
    const { externalMovieId, title, releaseYear } = req.body;

    if (!Number.isInteger(watchlistId)) {
      return res.status(400).json({ error: 'Invalid watchlist id' });
    }

    if (!externalMovieId || !title) {
      return res.status(400).json({ error: 'externalMovieId and title are required' });
    }

    const user = await getCurrentUser(req.user.uid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId: user.id,
      },
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    const movie = await prisma.movie.upsert({
      where: {
        externalMovieId: Number(externalMovieId),
      },
      update: {
        title,
        releaseYear: releaseYear ?? null,
      },
      create: {
        externalMovieId: Number(externalMovieId),
        title,
        releaseYear: releaseYear ?? null,
      },
    });

    const watchlistMovie = await prisma.watchlistMovie.create({
      data: {
        watchlistId: watchlist.id,
        movieId: movie.id,
      },
    });

    return res.status(201).json(watchlistMovie);
  } catch (error) {
    return res.status(409).json({ error: 'Movie already exists in this watchlist' });
  }
});

export default router;
