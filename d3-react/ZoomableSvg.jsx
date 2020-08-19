// Leverages d3-zoom for some simple zoom/pan behavior on a React-controlled SVG
import React, { useRef, useState, useEffect } from 'react'

import {
  select as d3select,
  event as d3event
} from 'd3-selection'

import { zoom as d3zoom } from 'd3-zoom'

export function ZoomableSvg ({
  width = 900,
  height = 600,
  children
}) {
  const svg = useRef()
  const [transform, setTransform] = useState(null)

  useEffect(() => {
    if (!svg.current) return;

    const svgNode = d3select(svg.current)
    const svgZoom = d3zoom().on('zoom', () => setTransform(d3event.transform))
    svgNode.call(svgZoom)

    return () => svgNode.on('.zoom', null) // Clear the event handler
  }, [])

  return (
    <svg ref={svg} width={width} height={height}>
      <g transform={transform}>{children}</g>
    </svg>
  )
}
