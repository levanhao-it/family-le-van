import React from 'react'
import { clsx } from 'clsx'
import { useAppStore } from '@/stores/appStore'

const SIZE_MAP = {
  sm: {
    shellClass: 'h-7 w-7 rounded-full',
    iconSize: 15,
  },
  md: {
    shellClass: 'h-9 w-9 rounded-[0.95rem]',
    iconSize: 16,
  },
  lg: {
    shellClass: 'h-11 w-11 rounded-2xl',
    iconSize: 18,
  },
}

const TONE_MAP = {
  muted: {
    dark: 'border-bronze/12 bg-bronze/7 text-bronze/58',
    light: 'border-bronze/12 bg-bronze/8 text-amber/58',
    hoverDark: 'group-hover:border-bronze/24 group-hover:bg-bronze/12 group-hover:text-bronze/88',
    hoverLight: 'group-hover:border-bronze/28 group-hover:bg-bronze/12 group-hover:text-amber',
  },
  active: {
    dark: 'border-bronze/45 bg-bronze/12 text-bronze',
    light: 'border-bronze/32 bg-bronze/12 text-amber',
    hoverDark: '',
    hoverLight: '',
  },
}

const IconChip = ({
  icon: Icon,
  size = 'md',
  tone = 'muted',
  hoverable = false,
  className = '',
  iconClassName = '',
}) => {
  const isDark = useAppStore((state) => state.isDark)
  const sizeConfig = SIZE_MAP[size] ?? SIZE_MAP.md
  const toneConfig = TONE_MAP[tone] ?? TONE_MAP.muted

  return (
    <span
      className={clsx(
        'flex flex-shrink-0 items-center justify-center border transition-all duration-300',
        sizeConfig.shellClass,
        isDark ? toneConfig.dark : toneConfig.light,
        hoverable && (isDark ? toneConfig.hoverDark : toneConfig.hoverLight),
        className
      )}
    >
      <Icon size={sizeConfig.iconSize} className={iconClassName} aria-hidden="true" />
    </span>
  )
}

export default IconChip