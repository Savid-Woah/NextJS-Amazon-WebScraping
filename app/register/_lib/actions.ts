'use server'

export async function register(email: string, password: string) {
  try {
    const api = process.env.API_URL
    const response = await fetch(`${api}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: email, password, role: 'USER' })
    })
    if (response.ok) {
      return true
    }

    return false
  } catch (error) {
    return false
  }
}
