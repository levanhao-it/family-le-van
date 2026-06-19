import React from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import StatusPage from '@/components/common/StatusPage'

const RouteErrorPage = () => {
  const error = useRouteError()

  const statusCode = isRouteErrorResponse(error) ? String(error.status) : '500'
  const title = isRouteErrorResponse(error) && error.status === 404
    ? 'Trang hien tai khong con san sang'
    : 'Da xay ra loi khi tai trang'

  const description = isRouteErrorResponse(error)
    ? error.statusText || 'Mot route trong ung dung khong the phan hoi nhu du kien.'
    : 'Ung dung da gap loi trong qua trinh tai route hoac render noi dung. Ban co the thu quay lai trang chu de tiep tuc.'

  const details = error instanceof Error
    ? error.message
    : isRouteErrorResponse(error)
      ? error.data
      : null

  return (
    <StatusPage
      code={statusCode}
      eyebrow="Route fallback"
      title={title}
      description={description}
      details={typeof details === 'string' ? details : null}
      actions={[
        <Link
          key="home"
          to="/"
          className="inline-flex min-w-40 items-center justify-center rounded-full border border-bronze bg-bronze px-6 py-3 text-sm font-medium text-obsidian transition hover:bg-bronze/90"
        >
          Ve trang chu
        </Link>,
        <button
          key="retry"
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex min-w-40 items-center justify-center rounded-full border border-bronze/35 px-6 py-3 text-sm font-medium text-primary transition hover:border-bronze/60 hover:bg-bronze/10"
        >
          Tai lai trang
        </button>,
      ]}
    />
  )
}

export default RouteErrorPage