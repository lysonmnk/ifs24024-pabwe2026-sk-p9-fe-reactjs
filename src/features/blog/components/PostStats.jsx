import React from 'react'
import { IconFiles, IconCircleCheck, IconEdit } from '@tabler/icons-react'

export const PostStats = ({ stats = { total: 0, published: 0, drafts: 0 } }) => {
  const cards = [
    {
      title: 'Total Artikel',
      value: stats.total || 0,
      icon: IconFiles,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-900/50',
    },
    {
      title: 'Total Selesai / Terbit',
      value: stats.published || 0,
      icon: IconCircleCheck,
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-900/50',
    },
    {
      title: 'Belum Selesai / Draf',
      value: stats.drafts || 0,
      icon: IconEdit,
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-900/50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" data-testid="post-stats">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className={`p-5 rounded-xl border ${card.borderColor} ${card.bgColor} flex items-center justify-between shadow-xs transition hover:shadow-md`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </p>
              <h3 className={`text-3xl font-extrabold mt-1 ${card.textColor}`}>
                {card.value}
              </h3>
            </div>
            <div className={`p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 ${card.textColor} shadow-xs`}>
              <Icon size={28} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PostStats
