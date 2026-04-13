import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { PrismaClient } from '@prisma/client'
import PortfolioClient from './PortfolioClient'

const prisma = new PrismaClient()

export default async function PortfolioPage() {
	const session = await getServerSession()

	if (!session || !session.user) {
		redirect("/api/auth/signin")
	}

	try {
		// Fetch user's investments with property details
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			include: {
				investments: {
					include: {
						property: true
					},
					orderBy: {
						createdAt: 'desc'
					}
				}
			}
		})

		if (!user) {
			return <PortfolioClient investments={[]} />
		}

		return <PortfolioClient investments={user.investments} />
	} catch (error) {
		console.error('Error fetching portfolio:', error)
		return <PortfolioClient investments={[]} />
	}
} 