'use client'

import Stomp from 'stompjs'
import SockJS from 'sockjs-client'
import { Client } from 'stompjs'

export const connectWebSocket = () => {
  const socketUrl = 'http://localhost:3001'
  const socket = new SockJS(socketUrl)
  const stompClient = Stomp.over(socket)
  stompClient.debug = () => {}

  return stompClient
}

export const disconnectWebSocket = (stompClient: Client) => {
  if (stompClient.connected) stompClient.disconnect(() => null)
  return
}
