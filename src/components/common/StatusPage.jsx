import React from 'react'

const StatusPage = ({
  code,
  eyebrow = 'Gia pha dong ho',
  title,
  description,
  details,
  actions,
}) => {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-obsidian px-6 py-16 text-primary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_45%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,1))]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center rounded-[2rem] border border-bronze/20 bg-black/20 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-12">
        {code ? (
          <p className="font-display text-sm uppercase tracking-[0.55em] text-bronze/70">
            {code}
          </p>
        ) : null}

        <p className="mt-4 text-xs uppercase tracking-[0.4em] text-muted">
          {eyebrow}
        </p>

        <h1 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-primary sm:text-5xl">
          {title}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary sm:text-base">
          {description}
        </p>

        {details ? (
          <pre className="mt-6 max-w-full overflow-x-auto rounded-2xl border border-bronze/15 bg-black/30 px-4 py-3 text-left text-xs leading-6 text-faint">
            {details}
          </pre>
        ) : null}

        {actions ? (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default StatusPage