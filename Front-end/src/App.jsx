import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import Layout from './Layout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import PollsPage from './pages/PollsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CreateAccountPage from './pages/CreateAccountPage.jsx';
import MyWatchlistsPage from './pages/MyWatchlistsPage.jsx';
import MyRatingsPage from './pages/MyRatingsPage.jsx';
import MovieTesterPage from './pages/MovieTesterPage.jsx';
import MovieDetailsPage from './pages/MovieDetailsPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'create-account',
        element: <CreateAccountPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'features',
        element: <FeaturesPage />,
      },
      {
        path: 'polls',
        element: <PollsPage />,
      },
      {
        path: 'my-watchlists',
        element: (
          <ProtectedRoute>
            <MyWatchlistsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-ratings',
        element: (
          <ProtectedRoute>
            <MyRatingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'movie-tester',
        element: (
          <ProtectedRoute>
            <MovieTesterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'movies/:movieId',
        element: <MovieDetailsPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
