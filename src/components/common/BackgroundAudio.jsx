import { useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/appStore'
import backgroundMusic from '@/data/music.mp3'

const BackgroundAudio = () => {
  const audioRef = useRef(null)
  const audioEnabled = useAppStore((s) => s.audioEnabled)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.28
    audio.loop = true

    if (audioEnabled) {
      const playPromise = audio.play()
      if (playPromise?.catch) {
        playPromise.catch(() => {
          // Browsers may block autoplay until the user interacts. The toggle button still works after interaction.
        })
      }
    } else {
      audio.pause()
    }
  }, [audioEnabled])

  return <audio ref={audioRef} src={backgroundMusic} preload="auto" />
}

export default BackgroundAudio
