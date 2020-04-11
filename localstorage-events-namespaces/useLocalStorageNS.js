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
