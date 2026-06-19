import React from 'react'
import StatusPage from './StatusPage'

class AppErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error) {
		return {
			hasError: true,
			error,
		}
	}

	componentDidCatch(error, errorInfo) {
		console.error('Unhandled application error', error, errorInfo)
	}

	handleReload = () => {
		window.location.reload()
	}

	render() {
		const { hasError, error } = this.state

		if (hasError) {
			return (
				<StatusPage
					code="500"
					eyebrow="He thong tam thoi gian doan"
					title="Da xay ra loi ngoai du kien"
					description="Trang dang duoc tai lai trong trang thai an toan. Ban co the thu nap lai ung dung hoac quay ve trang chu."
					details={error?.message}
					actions={[
						<button
							key="reload"
							type="button"
							onClick={this.handleReload}
							className="inline-flex min-w-40 items-center justify-center rounded-full border border-bronze bg-bronze px-6 py-3 text-sm font-medium text-obsidian transition hover:bg-bronze/90"
						>
							Thu tai lai
						</button>,
						<a
							key="home"
							href="/"
							className="inline-flex min-w-40 items-center justify-center rounded-full border border-bronze/35 px-6 py-3 text-sm font-medium text-primary transition hover:border-bronze/60 hover:bg-bronze/10"
						>
							Ve trang chu
						</a>,
					]}
				/>
			)
		}

		return this.props.children
	}
}

export default AppErrorBoundary