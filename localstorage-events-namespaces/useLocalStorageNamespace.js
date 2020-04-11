import React, { useCallback, useMemo } from 'react'

// localStore is independent from useLocalStorageNamespace, which implements
// namespacing and serves as a native api abstraction
export function useLocalStorageNamespace (namespace, storage = localStorage) {
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

  const handler = useMemo(() => ({
    set (ls, key, value) {
      ls.setItem(ns(key), value)
    },

    get (ls, prop) {
      switch (prop) {
        case 'getNS': return getNS

        // overrides native `clear`
        case 'clear': return clear

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
  }), [ns, getNS, clear])

  // need a proxy for opaquely namespacing keys on `{get|set|remove}Item`
  return new Proxy(storage, handler)
}
