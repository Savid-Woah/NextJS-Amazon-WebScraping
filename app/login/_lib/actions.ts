'use server'

import { cookies } from 'next/headers'

export async function login(email: string, password: string) {
  try {
    const api = process.env.API_URL
    const response = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: email, password })
    })
    if (response.ok) {
      const token = await response.text()
      cookies().set('token', token)
      return true
    }

    return false
  } catch (error) {
    return false
  }
}
