import React, { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import NotFoundPage from '@/pages/NotFoundPage'
import RouteErrorPage from '@/pages/RouteErrorPage'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const FamilyTreePage = lazy(() => import('@/pages/FamilyTreePage'))
const TimelinePage = lazy(() => import('@/pages/TimelinePage'))
const CalendarPage = lazy(() => import('@/pages/CalendarPage'))
const ActivitiesPage = lazy(() => import('@/pages/ActivitiesPage'))
const GalleryPage = lazy(() => import('@/pages/GalleryPage'))
const TemplePage = lazy(() => import('@/pages/TemplePage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const StatisticsPage = lazy(() => import('@/pages/StatisticsPage'))

// Cinematic loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-obsidian">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border border-bronze/30 rotate-45 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 border border-bronze/20 rotate-45 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
      </div>
      <p className="font-display text-bronze/60 text-xs tracking-[0.4em] uppercase">
        Đang tải...
      </p>
    </div>
  </div>
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'gia-pha',
        element: (
          <Suspense fallback={<PageLoader />}>
            <FamilyTreePage />
          </Suspense>
        ),
      },
      {
        path: 'lich-su',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TimelinePage />
          </Suspense>
        ),
      },
      {
        path: 'nghi-le',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: 'hoat-dong',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ActivitiesPage />
          </Suspense>
        ),
      },
      {
        path: 'hinh-anh',
        element: (
          <Suspense fallback={<PageLoader />}>
            <GalleryPage />
          </Suspense>
        ),
      },
      {
        path: 'nha-tho-ho',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TemplePage />
          </Suspense>
        ),
      },
      {
        path: 'ban-do',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MapPage />
          </Suspense>
        ),
      },
      {
        path: 'thong-ke',
        element: (
          <Suspense fallback={<PageLoader />}>
            <StatisticsPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

const AppRouter = () => <RouterProvider router={router} />

export default AppRouter