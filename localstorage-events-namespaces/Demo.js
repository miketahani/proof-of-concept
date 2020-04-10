import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLocalStorageNS, useLocalStorageSubscription } from './index'
import './style.css'

const DEFAULT_NAMESPACE = 'hook-demo'

export function Demo () {
  const keyInput = useRef()
  const valueInput = useRef()

  const [lastUpdate, setLastUpdate] = useState(false)

  const [namespace, setNamespace] = useState(DEFAULT_NAMESPACE)

  const updateNamespace = useCallback(e => {
    setNamespace(e.target.value)
  }, [])

  // need to trigger a re-render when the store updates
  const handleStoreEvent = useCallback((...args) => {
    setLastUpdate(Date.now())
  }, [])

  const reactiveStore = useLocalStorageSubscription(handleStoreEvent)
  const ns = useLocalStorageNS(namespace, reactiveStore)

  const addItem = () => {
    ns.setItem(keyInput.current.value, valueInput.current.value)
    keyInput.current.value = ''
    valueInput.current.value = ''
  }

  const items = useMemo(() => ns && ns.getNS(), [ns])

  return (
    <div className='demo-container'>
      Namespace: <input type='text' onChange={updateNamespace} defaultValue={namespace} />

      <div className='add-container'>
        <h3>Add Item</h3>
        <div className='add-fields'>
          <div><input ref={keyInput} type='text' placeholder='Key' /></div>
          <div><input ref={valueInput} type='text' placeholder='Value' /></div>
          <div>
            <button
              className='round add-item'
              aria-label='Add Item'
              onClick={addItem}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {ns && namespace.length > 0 &&
        <div className='storage-namespace-items'>
          <h3>Items in <code>{namespace}</code> namespace</h3>
          {items.length > 0 && items.map(([key, value]) =>
            <div className='item-fields' key={key}>
              <div><strong>{key}</strong></div>
              <div><span>{value}</span></div>
              <div>
                <button
                  className='round remove-item'
                  onClick={() => ns.removeItem(key)}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {items.length === 0 && <div className='no-items'>None</div>}
        </div>
      }
    </div>
  )
}
