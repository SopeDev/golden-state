'use client'
import { FormEvent } from 'react'

export default function Form() {
	const handleSubmit = async (e) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const response = await fetch(`/api/auth/register`, {
			method: 'POST',
			body: JSON.stringify({
				email: formData.get('email'),
				password: formData.get('password'),
			})
		})
		console.log({response})
	}

	return (
		<form className="flex flex-col gap-2 mx-auto max-w-2xl" onSubmit={handleSubmit}>
			<input name="email" className="border border-black" type="email"/>
			<input name="password" className="border border-black" type="password"/>
			<button type="submit">Register</button>
		</form>
	)
}