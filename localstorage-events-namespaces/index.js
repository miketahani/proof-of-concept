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

function eventedStorage (storage = localStorage) {
  const events = new Events()

  return new Proxy(storage, {
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
  })
}

// export { localStore: eventedStorage(localStorage) }
// 👇
// import { localStore } from './localStorage'
// localStore.subscribe((...args) => console.log(args))

const localStore = eventedStorage(localStorage)

// localStore is independent from useLocalStorageNS, which implements
// namespacing and serves as a native api abstraction
export function useLocalStorageNS (namespace, storage = localStorage) {
  const ns = useCallback((key = '') => `${namespace}/${key}`, [namespace])

  const getKeys = useCallback(() => {
    const _namespace = ns()
    return Object.keys(storage).filter(key => key.startsWith(_namespace))
  }, [ns, storage])

  const clear = useCallback(() => {
    // only clear our namespace
    getKeys().forEach(storage.removeItem)
  }, [getKeys, storage])

  const getNS = useCallback(() => {
    const _namespace = ns()
    return getKeys().map(key => [
      key.replace(_namespace, ''),
      storage.getItem(key)
    ])
  }, [ns, getKeys, storage])

  // need a proxy for opaquely namespacing keys on `{get|set|remove}Item`
  // FIXME cache the proxy in a ref so we're not constantly creating new
  //       proxies on rerenders?
  return new Proxy(storage, {
    set (ls, key, value) {
      ls.setItem(ns(key), value)
    },

    get (ls, prop) {
      switch (prop) {
        case 'clear': return clear
        case 'getNS': return getNS

        case 'setItem':
        case 'getItem':
        case 'removeItem': {
          // intercept, namespace the key, pass through
          return (key, ...args) => ls[prop].call(ls, ns(key), ...args)
        }

        default: {
          const p = ls[prop]
          return typeof(p) === 'function' ? p.bind(ls) : p
        }
      }
    }
  })
}

// import { localStore } from './localStore
export function useLocalStorageSubscription (onEvent) {
  const handleStoreEvent = useCallback((...args) => {
    console.log('handleStoreEvent', args)
    onEvent && onEvent(...args)
  }, [onEvent])

  useEffect(() => localStore.subscribe(handleStoreEvent), [handleStoreEvent])

  return localStore
}
