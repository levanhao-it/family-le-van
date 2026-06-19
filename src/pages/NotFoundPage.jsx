import React from 'react'
import { Link } from 'react-router-dom'
import StatusPage from '@/components/common/StatusPage'

const NotFoundPage = () => {
  return (
    <StatusPage
      code="404"
      eyebrow="Duong dan khong ton tai"
      title="Khong tim thay noi dung ban dang mo"
      description="Lien ket nay co the da thay doi, bi xoa hoac duoc nhap sai. Hay quay ve nhung khu vuc chinh de tiep tuc tra cuu gia pha."
      actions={[
        <Link
          key="home"
          to="/"
          className="inline-flex min-w-40 items-center justify-center rounded-full border border-bronze bg-bronze px-6 py-3 text-sm font-medium text-obsidian transition hover:bg-bronze/90"
        >
          Ve trang chu
        </Link>,
        <Link
          key="tree"
          to="/gia-pha"
          className="inline-flex min-w-40 items-center justify-center rounded-full border border-bronze/35 px-6 py-3 text-sm font-medium text-primary transition hover:border-bronze/60 hover:bg-bronze/10"
        >
          Mo cay gia pha
        </Link>,
      ]}
    />
  )
}

export default NotFoundPage