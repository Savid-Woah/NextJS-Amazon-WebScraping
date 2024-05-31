import { BellIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { getNotifications } from '../lib/data'
import Swal from 'sweetalert2'
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

export default function NotificationButton({ userId }: { userId: number }) {
    const { push } = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [notifications, setNotifications] = useState([] as any[])
    const [newNotification, setNewNotification] = useState(false)

    useEffect(() => {
        const socket = io('http://localhost:3001');

        socket.on(`wishlist-notification-for-user/${userId}`, (notification) => {
            setNotifications((prevNotifications) => {
                if (prevNotifications.length >= 5) prevNotifications.shift()
                return [...prevNotifications, notification]
            });
            if (!isOpen) setNewNotification(true)
        });

        return () => {
            socket.disconnect();
        }
    }, [userId])

    useEffect(() => {
        getNotifications().then((data: Array<any>) => {
            if (!data) {
                Swal.fire({
                    title: 'Ha ocurrido un error con las notificaciones.',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 1500
                })
                push('/')
                return
            }
            setNotifications(data)
            if (data.length > 0) {
                setNewNotification(true)
            }
        })
    }, [push])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [setIsOpen])

    const handleToggle = () => {
        setIsOpen(!isOpen);
        setNewNotification(false)
    }

    return (
        <div
            className='relative select-none h-full w-full justify-end flex items-center'
            ref={dropdownRef}>
            <button
                className='p-1 flex items-center relative justify-end hover:scale-105 transition-all'
                id='menu-button'
                aria-expanded='true'
                aria-haspopup='true'
                onClick={handleToggle}>
                <BellIcon className='h-5 w-5' />
                {newNotification && <span className='absolute top-[0.5px] bg-red-500 right-[0.5px] size-3 rounded-full animate-bounce'></span>}
            </button>
            <div
                className={`absolute text-sm right-0 left-0 flex-col rounded border border-t-0 bg-slate-300 transition-all top-full ${isOpen ? 'visible opacity-100' : 'invisible -translate-y-2 opacity-0 overflow-y-auto'
                    }`}>
                {notifications.length === 0 && (
                    <div className='w-full rounded p-2 flex items-center'>
                        No tienes notificaciones
                    </div>
                )}
                {notifications.length !== 0 && notifications.map(({ content, receivedAt, new: isNew }, index) => {
                    const name: string = content.name.length > 10 ? `${content.name.slice(0, 10)}...` : content.name
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                window.open(`https://www.amazon.com${content.url}`)
                            }}
                            className={`cursor-pointer w-full rounded p-2 hover:bg-slate-400/40 flex items-center justify-between ${isNew ? 'new-notification' : ''}`}>
                            <div className='flex items-center justify-center gap-2'>
                                <img
                                    src={content.imageUrl}
                                    alt={content.name}
                                    className='w-10 h-10 object-cover rounded'
                                />
                                <div className='flex flex-col items-start justify-center'>
                                    <p>{name}</p>
                                    <span className='text-xs'>{content.price}</span>
                                </div>
                            </div>
                            <div className='flex flex-col items-end justify-center'>
                                <span className='text-xs'>
                                    <TimeSince receivedAt={receivedAt} />
                                </span>
                                <span className='text-xs'>Ver página</span>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

const TimeSince = ({ receivedAt }: { receivedAt: string }) => {
    const [timeSince, setTimeSince] = useState<string>('')

    const calculateTimeSince = (receivedAt: string): string => {
        const receivedDate = new Date(receivedAt)
        const now = new Date()
        const diffInMs = now.getTime() - receivedDate.getTime()
        const diffInSeconds = Math.floor(diffInMs / 1000)
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        const diffInHours = Math.floor(diffInMinutes / 60)
        const diffInDays = Math.floor(diffInHours / 24)

        if (diffInDays > 0) {
            return `Hace ${diffInDays} días`
        } else if (diffInHours > 0) {
            return `Hace ${diffInHours} horas`
        } else if (diffInMinutes > 0) {
            return `Hace ${diffInMinutes} minutos`
        } else {
            return `Hace ${diffInSeconds} segundos`
        }
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeSince(calculateTimeSince(receivedAt))
        }, 1000)

        return () => clearInterval(intervalId)
    }, [receivedAt])

    return timeSince
}
