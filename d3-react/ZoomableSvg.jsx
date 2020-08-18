// Leverages d3-zoom for some simple zoom/pan behavior on a React-controlled SVG
import React, { useRef, useEffect } from 'react'

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
  const container = useRef()

  useEffect(() => {
    if (!svg.current) return;

    const zoomed = () => {
      d3select(container.current).attr('transform', d3event.transform)
    }

    const selection = d3select(svg.current)
    selection.call(d3zoom().on('zoom', zoomed))

    // Clear the event handler
    return () => selection.on('.zoom', null)
  }, [])

  return (
    <svg ref={svg} width={width} height={height}>
      <g ref={container}>{!!children && children}</g>
    </svg>
  )
}
