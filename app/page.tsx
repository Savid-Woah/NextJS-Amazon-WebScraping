'use client'

import { useEffect, useState } from 'react'
import { User, Product } from './lib/definitions'
import {
    ArrowLeftEndOnRectangleIcon,
    PlusIcon
} from '@heroicons/react/24/outline'
import Swal from 'sweetalert2'
import { addWish, logout } from './lib/actions'
import NotificationButton from './ui/notifications'
import { getCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { getWishlist } from './lib/data'
import io from 'socket.io-client';
import {
    ArrowRightIcon,
    CheckIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { deleteWish, editWish, decrypt } from './lib/actions'
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { push } = useRouter()

    const [newWishName, setNewWishname] = useState('')
    const [newWishPrice, setNewWishPrice] = useState('')
    const [wishlist, setWishlist] = useState([] as Product[])
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState({} as User)
    const [editingProduct, setEditingProduct] = useState({} as Product)

    useEffect(() => {
        const getUser = async () => {
            const token = await decrypt(getCookie('token') as string)
            if (!token) return
            const user: User = jwtDecode(token)
            setUser(user)
        }

        getUser()
    }, [])

    useEffect(() => {
        getWishlist().then(data => {
            if (!data) {
                Swal.fire({
                    title: 'Ha ocurrido un error.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500
                })
                push('/login')
                return
            }
            setWishlist(data)
        })
    }, [push])

    const handleAddNewWish = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setEditingProduct({} as Product)

        if (!newWishName || !newWishPrice) {
            Swal.fire({
                title: 'Rellena todos los campos.',
                icon: 'info',
                showConfirmButton: false,
                timer: 1500
            })
            setEditingProduct({} as Product)
            return
        }

        const newWish = await addWish({
            name: newWishName,
            price: Number(newWishPrice)
        })

        if (!newWish) {
            Swal.fire({
                title: 'Ha ocurrido un error.',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            })
            setEditingProduct({} as Product)
            return
        }

        const newWishList = [...wishlist, newWish]
        setNewWishname('')
        setNewWishPrice('')
        setWishlist(newWishList)
        setEditingProduct({} as Product)
    }

    const handleLogout = async () => {
        await logout()
    }

    const handleEdit = async (item: Product) => {
        if (editingProduct.name === item.name && editingProduct.price === item.price) {
            setEditingProduct({} as Product)
            return
        }
        if (!editingProduct.name || !editingProduct.price) {
            Swal.fire({
                title: 'Rellena todos los campos.',
                icon: 'info',
                showConfirmButton: false,
                timer: 1500
            })
            return
        }
        const updatedWish = await editWish({ id: item.id, name: editingProduct.name, price: editingProduct.price, userId: item.userId })

        if (!updatedWish) {
            Swal.fire({
                title: 'Ha ocurrido un error.',
                icon: 'error',
                showConfirmButton: false,
                timer: 1500
            })
            return
        }
        const newWishList = wishlist.map(wish => {
            if (wish.id === updatedWish.id) {
                return updatedWish
            }
            return wish
        })
        setWishlist(newWishList)
        setEditingProduct({} as Product)
    }

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro de eliminar este deseo?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        if (result.isConfirmed) {
            const deleted = await deleteWish(id)

            if (!deleted) {
                Swal.fire({
                    title: 'Ha ocurrido un error para eliminar el componente.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500
                })
                return
            }

            const newWishlist = wishlist.filter(x => x.id !== id)
            setWishlist(newWishlist)
        }
    }

    return (
        <section className='flex w-[40dvw] shadow-lg flex-col rounded-md h-[95dvh] bg-slate-200/70'>
            <header className='grid grid-cols-[40%_60%] p-4 border-b-2'>
                <h1 className='text-xl font-semibold flex flex-col'> Wish List 💌
                    <span className='text-xs'>{user.username}</span>
                </h1>
                <div className='flex justify-end gap-1'>
                    <NotificationButton userId={user.id} />
                    <button className='flex gap-1 font-medium px-3 py-1 items-center justify-center hover:scale-105 transition-all'
                        onClick={handleLogout}>
                        Salir
                        <ArrowLeftEndOnRectangleIcon className='h-5 w-5' />
                    </button>
                </div>
            </header>
            <main className='flex flex-col overflow-y-auto grow'>
                {wishlist?.map((item, index) => {
                    const editing = editingProduct.id === item.id
                    return (
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            handleEdit(item)
                        }} key={index} className='flex items-center justify-between p-4 border-b-2'>
                            <div className='flex flex-col gap-1'>
                                <input
                                    id={item.id}
                                    name='wish_name'
                                    className='text-base font-semibold outline-none max-w-[60%] disabled:border-b-transparent bg-transparent border-b border-b-black focus:outline-none transition-all'
                                    disabled={!editing}
                                    value={editing ? editingProduct.name : item.name}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    autoComplete='off'
                                    spellCheck='false'
                                />
                                <p className='text-sm flex items-center gap-1'>
                                    <span className='flex items-center gap-2'>
                                        Presupuesto $USD <ArrowRightIcon className='h-3 w-3' />
                                    </span>
                                    <input
                                        name='wish_price'
                                        className='text-base font-medium outline-none flex items-center text-center justify-center max-w-[28%] disabled:border-b-transparent bg-transparent border-b border-b-black focus:outline-none transition-all'
                                        disabled={!editing}
                                        value={editing ? `$${editingProduct.price}` : `$${item.price}`}
                                        onChange={e => {
                                            if (e.target.value.length > 9) return
                                            setEditingProduct({ ...editingProduct, price: Number(e.target.value.replace(/[^0-9]+/g, '')) })
                                        }}
                                        autoComplete='off'
                                        spellCheck='false'
                                    />
                                </p>
                            </div>
                            <div className='flex gap-4'>
                                {editing && (
                                    <>
                                        <button
                                            type='submit'
                                            className='px-2 py-1 hover:scale-105 transition-all'>
                                            <CheckIcon className='h-5 w-5' />
                                        </button>
                                        <button
                                            type='button'
                                            className='px-2 py-1 hover:scale-105 transition-all'
                                            onClick={() => setEditingProduct({} as Product)}>
                                            <XMarkIcon className='h-5 w-5' />
                                        </button>
                                    </>
                                )}
                                {!editing && (
                                    <>
                                        <button
                                            type='button'
                                            className='px-2 py-1 text-sm rounded-md hover:scale-105 transition-all'
                                            onClick={() => {
                                                const edit = async () => {
                                                    setEditingProduct(item)
                                                }
                                                edit().then(() =>
                                                    document.getElementById(item.id)?.focus()
                                                )
                                            }}>
                                            <PencilIcon className='h-5 w-5' />
                                        </button>
                                        <button
                                            type='button'
                                            className='px-2 py-1 text-sm rounded-md hover:scale-105 transition-all'
                                            onClick={() => handleDelete(item.id)}>
                                            <TrashIcon className='h-5 w-5' />
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    )
                })}
            </main>
            <footer>
                <form onSubmit={handleAddNewWish} className='grid grid-cols-3'>
                    <div className='flex p-4 bg-slate-300/70 hover:bg-slate-300/90'>
                        <input
                            type='text'
                            id='new-wish-name'
                            name='new-wish-name'
                            placeholder='Nombre'
                            value={newWishName}
                            onChange={e => setNewWishname(e.target.value)}
                            className='w-full p-2 border-b border-black text-center transition-all bg-transparent text-sm focus:outline-none outline-none disabled:opacity-50'
                            disabled={loading}
                            autoComplete='off'
                            spellCheck='false'
                        />
                    </div>
                    <div className='flex p-4 bg-slate-300/70 hover:bg-slate-300/90'>
                        <input
                            type='text'
                            id='new-wish-price'
                            name='new-wish-price'
                            placeholder='Presupuesto $USD'
                            value={newWishPrice.length > 0 ? `$${newWishPrice}` : newWishPrice}
                            onChange={e =>
                                setNewWishPrice(e.target.value.replace(/[^0-9]+/g, ''))
                            }
                            className='w-full p-2 border-b border-black transition-all bg-transparent text-center text-sm focus:outline-none outline-none disabled:opacity-50'
                            disabled={loading}
                            autoComplete='off'
                        />
                    </div>
                    <button
                        className='flex gap-2 items-center justify-center text-sm w-full p-4 bg-violet-500 text-white hover:bg-violet-600/90 focus:bg-violet-600/90 transition-all outline-none focus:outline-none disabled:opacity-50'
                        disabled={loading}>
                        Nuevo deseo <PlusIcon className='h-5 w-5' />
                    </button>
                </form>
            </footer>
        </section>
    )
}
