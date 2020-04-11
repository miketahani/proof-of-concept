import React, { useEffect, useCallback } from 'react'

class Events {
  _subscribers = {}
  _subscriberCount = 0

  subscribe = callback => {
    const id = this._subscriberCount++
    this._subscribers[id] = callback
    return () => delete this._subscribers[id]
  }

  dispatch = (...args) => {
    Object.values(this._subscribers).forEach(callback => callback(...args))
  }
}

function eventedStorage (
  storage = localStorage,
  shouldOverrideWindowStorage = false
) {
  const events = new Events()

  const handler = {
    set (ls, prop, value) {
      ls[prop] = value
      events.dispatch('setItem', prop, value)
    },

    get (ls, prop) {
      switch (prop) {
        case 'subscribe': {
          // route to events
          return events[prop].bind(events)
        }
        case 'setItem':
        case 'removeItem':
        case 'clear': {
          // intercept native calls and emit an event after they run
          return (...args) => {
            ls[prop].apply(ls, args)
            events.dispatch(prop, ...args)
          }
        }
        default: {
          // passthrough to localStorage
          const p = ls[prop]
          // methods lose their context when we pass them here, so bind them
          // to their original instances
          return typeof(p) === 'function' ? p.bind(ls) : p
        }
      }
    }
  }

  const proxy = new Proxy(storage, handler)

  if (window && shouldOverrideWindowStorage) {
    Object.defineProperty(window, 'localStorage', { get: () => proxy })
  }

  return proxy
}

// export { localStore: eventedStorage(localStorage) }
// 👇
// import { localStore } from './localStorage'
// localStore.subscribe((...args) => console.log(args))

const localStore = eventedStorage(localStorage)

// import { localStore } from './localStore
export function useLocalStorageSubscription (onEvent) {
  const handleStoreEvent = useCallback((...args) => {
    console.log('handleStoreEvent', args)
    onEvent && onEvent(...args)
  }, [onEvent])

  useEffect(() => localStore.subscribe(handleStoreEvent), [handleStoreEvent])

  return localStore
}
