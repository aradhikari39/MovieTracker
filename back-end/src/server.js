import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.js';
import userRoutes from './routes/users.js';
import watchlistRoutes from './routes/watchlists.js';
import movieRoutes from './routes/movies.js';
import ratingRoutes from './routes/ratings.js';
import tmdbRoutes from './routes/tmdb.js';
import pollRoutes from './routes/polls.js';


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


  return app;
}
