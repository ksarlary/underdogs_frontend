import { createBrowserRouter } from 'react-router-dom'
import AdminRoute from '../components/auth/AdminRoute'
import RootRoute from '../components/auth/RootRoute'
import AdminLayout from '../components/layout/AdminLayout'
import AppLayout from '../components/layout/AppLayout'
import AdminBetsPage from '../pages/AdminBetsPage'
import AdminPage from '../pages/AdminPage'
import AdminTeamsPage from '../pages/AdminTeamsPage'
import AdminTournamentsPage from '../pages/AdminTournamentsPage'
import MatchDetailPage from '../pages/MatchDetailPage'
import MatchesPage from '../pages/MatchesPage'
import MyBetsPage from '../pages/MyBetsPage'
import NotFoundPage from '../pages/NotFoundPage'
import TournamentDetailPage from '../pages/TournamentDetailPage'
import TournamentsPage from '../pages/TournamentsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RootRoute />,
      },
      {
        path: 'tournaments',
        element: <TournamentsPage />,
      },
      {
        path: 'tournaments/:id',
        element: <TournamentDetailPage />,
      },
      {
        path: 'matches',
        element: <MatchesPage />,
      },
      {
        path: 'matches/:id',
        element: <MatchDetailPage />,
      },
      {
        path: 'my-bets',
        element: <MyBetsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
      {
        path: 'bets',
        element: <AdminBetsPage />,
      },
      {
        path: 'teams',
        element: <AdminTeamsPage />,
      },
      {
        path: 'tournaments',
        element: <AdminTournamentsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
