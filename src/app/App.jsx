import React, { useEffect } from 'react'
import { HeroUIProvider } from '@heroui/react'
import AppRouter from './router'
import AppErrorBoundary from '@/components/common/AppErrorBoundary'
import { useAppStore } from '@/stores/appStore'

const App = () => {
	const isDark = useAppStore((s) => s.isDark)

	useEffect(() => {
		const html = document.documentElement
		if (isDark) {
			html.classList.add('dark')
			html.classList.remove('light-theme')
		} else {
			html.classList.remove('dark')
			html.classList.add('light-theme')
		}
	}, [isDark])

	return (
		<HeroUIProvider>
			<AppErrorBoundary>
				<AppRouter />
			</AppErrorBoundary>
		</HeroUIProvider>
	)
}

export default App