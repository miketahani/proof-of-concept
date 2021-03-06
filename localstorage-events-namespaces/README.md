# localstorage-events-namespaces

Two different ideas:

1. Creating `localStorage` change events (within the same `window` context)
2. Hook for opaque namespacing support for `localStorage`

### Motivation

To learn more about hooks and [Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

Additionally, the window [`storage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) event only fires "when a storage area ... has been modified in the context of another document," so I wondered how to coordinate different components in the same document modifying `localStorage` at the same time. While not a common use-case, it was interesting to consider.

### 1. Events

`eventedStorage()` takes a storage area (e.g., `localStorage`) and returns a proxy that intercepts store-modifying calls (`setItem`, `removeItem`, `clear`) and passes their arguments to an event emitter (an instance of the `Events` class).

Note that this will "create" (intercept) a "reserved" key: `subscribe`.

For example:

```js
const store = eventedStorage(localStorage)   // [1]
const unsubscribe = store.subscribe(         // [2]
  (method, ...args) => console.log('store event:', method, args)
)
store.setItem('testing', 'success!')         // [3]
unsubscribe()
```
1. Returns a proxy for `localStorage` that emits `localStorage` events
2. Subscribes to store change events (`subscribe` returns an unsubscribe function)
3. `store event: setItem ‣(2) ["testing", "success!"]`

A huge caveat: this will only emit events when the event adapter is instantiated once, then imported and used in place of native `localStorage` references across your code. To listen for changes that don't occur via the adapter (e.g., direct manipulation of the original storage object by a developer or a different storage abstraction), a second boolean argument can be passed – `shouldOverrideWindowStorage`. This will trigger the use of `Object.defineProperty` to override the window `localStorage` property so all calls to `localStorage` are intercepted by the event proxy. For example:

```js
const store = eventedStorage(localStorage, true) // [1]
localStorage.subscribe((...args) => console.log('localStorage:', args))
localStorage.setItem('testing', 'success!')      // [2]
```
1. `store` and `window.localStorage` are now the same thing
2. `localStorage: ‣(3) ["setItem", "testing", "success!"]`

#### Hook

The `useLocalStorageSubscription` hook takes a global reactive storage area (i.e., the above resulting storage proxy) and a callback, and subscribes the callback to storage events.

### 2. Namespaces

The `useLocalStorageNamespace` hook takes a namespace and a storage area and returns a proxy that acts just like the provided area but with two additional methods:

1. `clear`, which clears the keys for the namespace in the storage area
2. `getNS`, which returns an array of `[key, value]` for the keys in the namespace

### TODO

- `window.addEventListener('storage', ...)` for events in other documents
