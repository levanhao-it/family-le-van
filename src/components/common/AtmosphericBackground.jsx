import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { useAppStore } from '@/stores/appStore'

// Floating dust particles for the atmospheric hero background
const ParticleField = () => {
	const canvasRef = useRef(null)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')

		let animFrame
		let particles = []

		const resize = () => {
			canvas.width = canvas.offsetWidth
			canvas.height = canvas.offsetHeight
		}

		class Particle {
			constructor() {
				this.reset()
			}
			reset() {
				this.x = Math.random() * canvas.width
				this.y = Math.random() * canvas.height
				this.size = Math.random() * 2 + 0.5
				this.speedX = (Math.random() - 0.5) * 0.3
				this.speedY = -Math.random() * 0.4 - 0.1
				this.opacity = Math.random() * 0.3 + 0.05
				this.life = 1
				this.decay = Math.random() * 0.003 + 0.001
			}
			update() {
				this.x += this.speedX
				this.y += this.speedY
				this.life -= this.decay
				if (this.life <= 0 || this.y < -10) this.reset()
			}
			draw() {
				ctx.save()
				ctx.globalAlpha = this.opacity * this.life
				ctx.fillStyle = `rgba(214, 185, 140, 1)`
				ctx.beginPath()
				ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
				ctx.fill()
				ctx.restore()
			}
		}

		const init = () => {
			resize()
			particles = Array.from({ length: 60 }, () => new Particle())
		}

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height)
			particles.forEach((p) => {
				p.update()
				p.draw()
			})
			animFrame = requestAnimationFrame(animate)
		}

		init()
		animate()
		window.addEventListener('resize', resize)

		return () => {
			cancelAnimationFrame(animFrame)
			window.removeEventListener('resize', resize)
		}
	}, [])

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full pointer-events-none"
			aria-hidden="true"
		/>
	)
}

// Animated light rays
const LightRays = () => (
	<div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
		{[...Array(5)].map((_, i) => (
			<motion.div
				key={i}
				className="absolute top-0 origin-top"
				style={{
					left: `${15 + i * 18}%`,
					width: `${1 + Math.random()}px`,
					height: '70%',
					background: `linear-gradient(180deg, rgba(214,185,140,${0.04 + i * 0.01}) 0%, transparent 100%)`,
					transform: `rotate(${-5 + i * 3}deg)`,
				}}
				animate={{ opacity: [0.3, 0.7, 0.3] }}
				transition={{
					duration: 4 + i,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: i * 0.8,
				}}
			/>
		))}
	</div>
)

// Fog/smoke layer
const FogLayer = ({ isDark }) => (
	<div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none" aria-hidden="true">
		<div
			className="w-full h-full"
			style={{
				background: isDark
					? 'linear-gradient(0deg, rgba(31,26,23,1) 0%, rgba(31,26,23,0.6) 40%, transparent 100%)'
					: 'linear-gradient(0deg, rgba(237,228,211,1) 0%, rgba(237,228,211,0.6) 40%, transparent 100%)',
			}}
		/>
	</div>
)

const AtmosphericBackground = () => {
	const isDark = useAppStore((s) => s.isDark)
	return (
		<div className="absolute inset-0">
			{/* Base gradient */}
			<div className={clsx(
				'absolute inset-0 bg-gradient-to-b',
				isDark ? 'from-lacquer via-obsidian to-charcoal' : 'from-[#EDE4D3] via-[#FAF4E8] to-[#F0E8D8]'
			)} />

			{/* Radial bronze glow */}
			<motion.div
				className="absolute inset-0"
				style={{
					background:
						'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(140,106,67,0.12) 0%, transparent 70%)',
				}}
				animate={{ opacity: [0.6, 1, 0.6] }}
				transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
			/>

			{/* Secondary glow */}
			<motion.div
				className="absolute inset-0"
				style={{
					background:
						'radial-gradient(ellipse 40% 40% at 30% 60%, rgba(192,57,43,0.05) 0%, transparent 60%)',
				}}
				animate={{ opacity: [0.3, 0.7, 0.3] }}
				transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
			/>

			{/* Particles */}
			<ParticleField />

			{/* Light rays */}
			<LightRays />

			{/* Fog */}
			<FogLayer isDark={isDark} />

			{/* Vignette */}
			<div className="absolute inset-0 vignette" />
		</div>
	)
}

export default AtmosphericBackground