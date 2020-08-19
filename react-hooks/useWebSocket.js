/**
 * Simple hook that uses a native WebSocket connection. Example consumer:
 *
 *   import React, { useState } from 'react'
 *   import { useWebSocket } from './useWebSocket'
 *
 *   export function WSHookDemo () {
 *     const [latestMessage, setLatestMessage] = useState(null)
 *     const { status, error, send } = useWebSocket('ws://localhost:7000', setLatestMessage)
 *     return (
 *       <div>
 *         status code: {status}<br />
 *         error: {error || 'no errors!'}<br />
 *         latest message: {latestMessage ? JSON.parse(latestMessage.data) : 'no messages!'}
 *       </div>
 *     )
 *   }
 */
import React, { useState, useEffect, useRef } from 'react'

export function useWebSocket (url, onMessage) {
  const ws = useRef()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (ws.current) return;

    const handleSocketOpen = () => setError(false)
    const handleSocketError = error => setError(error)

    const socket = ws.current = new WebSocket(url)
    socket.addEventListener('open', handleSocketOpen)
    socket.addEventListener('error', handleSocketError)
    return () => {
      socket.removeEventListener('open', handleSocketOpen)
      socket.removeEventListener('error', handleSocketError)
      socket.close()
    }
  }, [url])

  // Separate the message handling from the other websocket events because
  // if we're using hooks, the message handler may change frequently (as the
  // consumer may redefine the message handler based on external deps and
  // sometimes we don't want to continuously connect and disconnect from a
  // streaming socket.
  useEffect(() => {
    if (!ws.current) return;
    ws.current.addEventListener('message', onMessage)
    return () => ws.current.removeEventListener('message', onMessage)
  }, [onMessage])

  const send = message =>
    ws.current?.readyState === WebSocket.OPEN && ws.current.send(message)

  return {
    status: ws.current?.readyState || WebSocket.CONNECTING,
    error,
    send
  }
}
