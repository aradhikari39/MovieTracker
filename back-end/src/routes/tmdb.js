import { Router } from 'express';

const router = Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function getTmdbHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

router.get('/trending', async (req, res) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/day`, {
      headers: getTmdbHeaders(),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch trending movies from TMDB' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'TMDB trending request failed' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const query = req.query.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;

    const response = await fetch(url, {
      headers: getTmdbHeaders(),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to search movies from TMDB' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'TMDB search request failed' });
  }
});

router.get('/movie/:movieId', async (req, res) => {
  try {
    const movieId = req.params.movieId;

    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?language=en-US`, {
      headers: getTmdbHeaders(),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch movie details from TMDB' });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'TMDB movie details request failed' });
  }
});

export default router;
