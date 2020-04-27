// add line numbers to console.log, using proxies to wrap native browser APIs.
// unfortunately, this breaks console.log css styling via `%c`.
;(function () {
  let lineNum = 0

  const proxy = new Proxy(globalThis.console || {}, {
    get (_console, prop) {
      if (prop === 'log') {
        return (...args) => _console.log.call(_console, ++lineNum, ...args)
      }
      const p = _console[prop]
      return typeof(p) === 'function' ? p.bind(con) : p
    }
  })

  Object.defineProperty(globalThis, 'console', { get: () => proxy })
})();
