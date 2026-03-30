import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import Layout from './Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearcgPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CreateAccountPage from './pages/CreateAccountPage.jsx';
import MyWatchlistsPage from './pages/MyWatchlistsPage.jsx';
import MyRatingsPage from './pages/MyRatingsPage.jsx';
import MovieTesterPage from './pages/MovieTesterPage.jsx';

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
        path: 'my-watchlists',
        element: <MyWatchlistsPage />,
      },
      {
        path: 'my-ratings',
        element: <MyRatingsPage />,
      },
      {
        path: 'movie-tester',
        element: <MovieTesterPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
