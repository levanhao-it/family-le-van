// Motion presets for the ancestral platform
// All animations are purposeful, cinematic, and premium

export const SPRING_GENTLE = { type: 'spring', stiffness: 200, damping: 30 }
export const SPRING_BOUNCY = { type: 'spring', stiffness: 300, damping: 20 }
export const SPRING_SLOW = { type: 'spring', stiffness: 100, damping: 25 }
export const EASE_CINEMATIC = [0.22, 1, 0.36, 1]
export const EASE_PREMIUM = [0.4, 0, 0.2, 1]

// Page & section enter animations
export const motionVariants = {
  // Fade in from bottom
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: EASE_CINEMATIC },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } },
  },

  // Cinematic fade
  cinematicFade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.2, ease: EASE_PREMIUM },
    },
    exit: { opacity: 0, transition: { duration: 0.6 } },
  },

  // Scale reveal
  scaleReveal: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.9, ease: EASE_CINEMATIC },
    },
  },

  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  },

  // Stagger item
  staggerItem: {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_CINEMATIC },
    },
  },

  // Slide in from left
  slideLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: EASE_CINEMATIC },
    },
  },

  // Slide in from right
  slideRight: {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: EASE_CINEMATIC },
    },
  },

  // Hero text reveal
  heroReveal: {
    hidden: { opacity: 0, y: 80, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1.2, ease: EASE_CINEMATIC },
    },
  },

  // Card hover
  cardHover: {
    rest: { scale: 1, boxShadow: '0 0 0px rgba(214,185,140,0)' },
    hover: {
      scale: 1.02,
      boxShadow: '0 0 30px rgba(214,185,140,0.2)',
      transition: SPRING_GENTLE,
    },
  },

  // Modal entrance
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_CINEMATIC },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 10,
      transition: { duration: 0.3 },
    },
  },

  // Overlay backdrop
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  },

  // Timeline item
  timelineItem: {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: EASE_CINEMATIC },
    },
  },

  // Bronze line draw
  lineGrow: {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 1.0, ease: EASE_CINEMATIC, delay: 0.3 },
    },
  },
}

// Scroll-linked animation config
export const scrollConfig = {
  viewport: { once: true, margin: '-80px' },
  viewport_repeat: { once: false, margin: '-80px' },
}

// Particle animation for hero atmospheric effects
export const particleConfig = {
  count: 50,
  speedRange: [0.2, 0.8],
  sizeRange: [1, 3],
  opacityRange: [0.1, 0.4],
  colorRange: ['rgba(214,185,140,0.3)', 'rgba(201,168,76,0.2)', 'rgba(245,239,230,0.15)'],
}