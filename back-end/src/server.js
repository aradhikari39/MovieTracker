import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import healthRoutes from './routes/health.js';
import userRoutes from './routes/users.js';
import watchlistRoutes from './routes/watchlists.js';
import movieRoutes from './routes/movies.js';
import ratingRoutes from './routes/ratings.js';
import tmdbRoutes from './routes/tmdb.js';
import pollRoutes from './routes/polls.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer() {
  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );

  app.use(express.json());

  app.use('/api/health', healthRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/watchlists', watchlistRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/tmdb', tmdbRoutes);
  app.use('/api/polls', pollRoutes);

  app.use(express.static(path.join(__dirname, '../dist')));

  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  return app;
}
