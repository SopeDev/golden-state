import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function POST(request) {
	try {
		const { email, password } = await request.json()
		//validate email and password

		const hashedPassword = await hash(password, 10)

		const newUser = await prisma.user.create({
			data: {
				email,
				password: hashedPassword
			}
		})

		console.log({email, password})
	} catch(e) {
		console.log({e})
	}

	return NextResponse.json({ message: 'success' })
}