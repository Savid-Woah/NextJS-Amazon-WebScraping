'use client'

import Link from 'next/link'
import { useState } from 'react'
import { login } from './_lib/actions'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const { push } = useRouter()
    const [loading, setLoading] = useState(false)

    const handleCustomLogin = async (e: FormData) => {
        setLoading(true)

        const email = e.get('email')?.toString()
        const password = e.get('password')?.toString()

        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'Debes completar todos los campos'
            })
            setLoading(false)
            return
        }

        const logged = await login(email, password)

        if (logged) {
            Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Has iniciado sesión correctamente'
            })
            push('/')
            setLoading(false)
            return
        }

        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'No se ha podido iniciar sesión, verifica tus credenciales'
        })
        setLoading(false)
    }

    return (
        <div className='grid grid-cols-[40%_60%] shadow-lg items-center text-primary p-5 rounded-md bg-slate-200/50 justify-center w-[60%]'>
            <div className='p-20 pr-10 min-h-fit flex items-center justify-center flex-col'>
                <h1 className='text-4xl font-semibold text-nowrap'>My Wish List</h1>
                <h3 className='text-xl font-medium text-nowrap text-violet-500'>Iniciar sesión</h3>
            </div>
            <form
                action={handleCustomLogin}
                className='flex flex-col gap-4 px-20 py-10 items-start justify-center w-full'>
                <label className='flex flex-col w-full'>
                    <span>Correo electrónico</span>
                    <input
                        type='email'
                        id='email'
                        name='email'
                        className='p-2 rounded-md bg-transparent border border-black focus:outline-none'
                        autoFocus
                        spellCheck='false'
                        autoComplete='off'
                    />
                </label>
                <label className='flex flex-col w-full'>
                    <span>Contraseña</span>
                    <input
                        type='password'
                        id='password'
                        name='password'
                        className='p-2 rounded-md bg-transparent border border-black focus:outline-none'
                    />
                </label>
                <div className='flex flex-col gap-1 w-full'>
                    <button
                        type='submit'
                        className='p-2 w-full rounded-md border border-black bg-violet-500 text-white hover:scale-105 transition-all disabled:opacity-60'
                        disabled={loading}
                        aria-disabled={loading}>
                        Iniciar sesión
                    </button>
                    <div className='min-h-px my-2 bg-black w-full'></div>
                    <button
                        type='button'
                        onClick={() => {
                            const loading = async () => {
                                setLoading(true)
                            }
                            loading().then(() => window.location.href =
                                'http://localhost:3001/api/v1/auth/google-login'
                            )
                        }}
                        className='p-2 w-full rounded-md border border-black bg-transparent hover:scale-105 transition-all disabled:opacity-60'
                        disabled={loading}
                        aria-disabled={loading}>
                        Google
                    </button>
                    <button
                        type='button'
                        onClick={() => {
                            const loading = async () => {
                                setLoading(true)
                            }
                            loading().then(() => window.location.href =
                                'http://localhost:3001/api/v1/auth/facebook-login'
                            )
                        }}
                        className='p-2 w-full rounded-md border text-white border-black bg-blue-500 hover:scale-105 transition-all disabled:opacity-60'
                        disabled={loading}
                        aria-disabled={loading}>
                        Facebook
                    </button>
                </div>
                <p className='text-sm'>
                    Si no tienes una cuenta por favor,{' '}
                    <Link href={'/register'} className='text-blue-600'>
                        regístrate
                    </Link>
                </p>
            </form>
        </div>
    )
}
