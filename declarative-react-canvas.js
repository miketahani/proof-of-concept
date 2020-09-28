import React, { useRef, useState, useEffect, useContext } from 'react'

// Canvas.js
const CanvasContext = React.createContext()

// Get the React context value (<canvas> element) and its CanvasRenderingContext2D
export const useCanvasContext = () => useContext(CanvasContext).getContext('2d')

export function Canvas ({ width, height, children }) {
  const canvas = useRef()
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  return (
    <React.Fragment>
      <canvas ref={canvas} width={width} height={height} />

      {isMounted &&
        <CanvasContext.Provider value={canvas.current}>
          {children && children}
        </CanvasContext.Provider>
      }
    </React.Fragment>
  )
}

// Line.js
// import { useCanvasContext } from './Canvas'

export function Line ({ x1, y1, x2, y2 }) {
  const canvasContext = useCanvasContext()

  canvasContext.moveTo(x1, y1)
  canvasContext.lineTo(x2, y2)
  canvasContext.stroke()

  return null
}

const LINES = Array.from({ length: 100 }, () => ({
  x1: Math.random() * 900 | 0,
  y1: Math.random() * 600 | 0,
  x2: Math.random() * 900 | 0,
  y2: Math.random() * 600 | 0
}))
export function Demo () {
  return (
    <Canvas width={900} height={600}>
      {LINES.map((props, i) => <Line {...props} key={i} />)}
    </Canvas>
  )
}
