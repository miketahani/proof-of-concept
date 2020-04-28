// add line numbers to console.log
// unfortunately, this breaks console.log css styling via `%c`.
;(function () {
  const _consoleLog = globalThis.console.log.bind(globalThis.console)
  let lineNum = 0
  Object.defineProperty(globalThis.console, 'log', {
    get: () => (...args) => _consoleLog(++lineNum, ...args)
  })
})();
