'use server'

import { jwtDecode } from 'jwt-decode'
import { cookies } from 'next/headers'
import { User } from './definitions'
import { decrypt } from './actions'

export async function getWishlist() {
  try {
    const token = await decrypt(cookies().get('token')?.value as string)
    if (!token) throw new Error('No token found')
    const jwt: User = jwtDecode(token)
    const { id } = jwt
    if (!id) throw new Error('No user found')
    const api = process.env.API_URL
    const response = await fetch(`${api}/products/get-all-by-user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Error fetching')
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error(error)
    cookies().delete('token')
    return false
  }
}


export async function getNotifications() {
  try {
    const token = await decrypt(cookies().get('token')?.value as string)
    if (!token) throw new Error('No token found')
    const jwt: User = jwtDecode(token)
    const { id } = jwt
    if (!id) throw new Error('No user found')
    const api = process.env.API_URL
    const response = await fetch(`${api}/notifications/get-last-three-by-user/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) throw new Error('Error fetching')
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error(error)
    cookies().delete('token')
    return false
  }
}