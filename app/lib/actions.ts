'use server'

import { cookies } from 'next/headers'
import { User, Product } from './definitions'
import { jwtDecode } from 'jwt-decode'
import { redirect } from 'next/navigation'
import * as crypto from 'crypto'

const api = process.env.API_URL
const aesKey = process.env.AES_KEY as crypto.CipherKey


export async function decrypt(encryptedText: string) {
    if (!encryptedText) return null
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export async function addWish({
  name,
  price
}: {
  name: string
  price: number
}) {
  try {
    const token = await decrypt(cookies().get('token')?.value as string)
    if (!token) throw new Error('No token found')
    const { id: userId }: User = jwtDecode(token)
    if (!userId) throw new Error('No user found')
    const res = await fetch(`${api}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, userId })
    })
    if (!res.ok) throw new Error('Error fetching')
      const data = await res.json()
      return data.data
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function editWish({ name, price, id, userId }: Product) {
  try {
    const token = await decrypt(cookies().get('token')?.value as string)
    if (!token) throw new Error('No token found')
    const { id: userId }: User = jwtDecode(token)
    if (!userId) throw new Error('No user found')
    const res = await fetch(`${api}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, price, userId })
    })
    if (!res.ok) throw new Error('Error fetching')
      const data = await res.json()
      return data.data
  
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function deleteWish(id: string) {
  try {
    const token = await decrypt(cookies().get('token')?.value as string)
    if (!token) throw new Error('No token found')
    const { id: userId }: User = jwtDecode(token)
    if (!userId) throw new Error('No user found')
    const res = await fetch(`${api}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error('Error fetching')
      return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function logout() {
  try {
    const token = await decrypt(cookies().get('token')?.value as string)
    await fetch(`${api}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application',
        'Authorization': `Bearer ${token}`
      }
    })

  } catch (error) {}
  cookies().delete('token')
  redirect('/login')
}