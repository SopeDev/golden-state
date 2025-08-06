import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

export default async function DashboardPage() {
	const session = await getServerSession()

	if (!session || !session.user) {
		redirect("/api/auth/signin")
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-16">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl font-bold text-main-blue mb-8 text-center">Dashboard</h1>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-white rounded-lg p-6 border border-off-white shadow-md hover:shadow-lg transition-shadow">
							<h2 className="text-2xl font-bold text-main-blue mb-4">My Portfolio</h2>
							<p className="text-main-text mb-4">Track your real estate investments and performance.</p>
							<a href="/dashboard/portfolio" className="inline-block bg-main-blue hover:bg-secondary-blue text-white font-semibold py-3 px-6 rounded-lg transition-colors">
								View Portfolio
							</a>
						</div>
						
						<div className="bg-white rounded-lg p-6 border border-off-white shadow-md hover:shadow-lg transition-shadow">
							<h2 className="text-2xl font-bold text-main-blue mb-4">Available Projects</h2>
							<p className="text-main-text mb-4">Explore new investment opportunities.</p>
							<a href="/projects" className="inline-block bg-main-gold hover:bg-secondary-gold text-white font-semibold py-3 px-6 rounded-lg transition-colors">
								Browse Projects
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
} 