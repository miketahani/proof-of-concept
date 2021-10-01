import { useState, useEffect, useRef, useMemo } from 'react'

const isIntersecting = (a, b) => {
  return !(
    a.maxX < b.minX ||
    a.minX > b.maxX ||
    a.maxY < b.minY ||
    a.minY > b.maxY
  )
}

const boxes = Array.from({ length: 40 }, (_, i) => i)

export default function BoxSelection () {
  const container = useRef()
  const [startPoint, setStartPoint] = useState(null)
  const [endPoint, setEndPoint] = useState(null)
  const [insideBounds, setInsideBounds] = useState([])

  // FIXME Make `drag` state, instead of startPoint and endPoint
  const drag = useMemo(() => {
    if (!startPoint || !endPoint) return null

    return {
      minX: Math.min(startPoint[0], endPoint[0]),
      minY: Math.min(startPoint[1], endPoint[1]),
      maxX: Math.max(startPoint[0], endPoint[0]),
      maxY: Math.max(startPoint[1], endPoint[1])
    }
  }, [startPoint, endPoint])

  // When user mouses down, set the start x and y; clear boxes in bounds
  // When the user moves after mousedown, store end x and y
  //   Then calculate the bounding box and see which boxes fall into it
  // When the user mouses up, reset start and end points
  useEffect(() => {
    function mousedown(e) {
      setInsideBounds([])
      setStartPoint([e.clientX, e.clientY])
    }

    function mousemove(e) {
      if (!startPoint) return;

      setEndPoint([e.clientX, e.clientY])

      if (!drag) return;

      // Find boxes that lay inside bounding box
      // FIXME Cache the bboxes on resize instead of recalculating on mousemove
      const boxes = Array.from(container.current.querySelectorAll('.Box'))
        .filter(candidate => {
          const bbox = candidate.getBoundingClientRect()
          const rectA = drag
          const rectB = {
            minX: bbox.x,
            minY: bbox.y,
            maxX: bbox.x + bbox.width,
            maxY: bbox.y + bbox.height
          }
          return isIntersecting(rectA, rectB)
        })
        .map(el => +el.dataset.box)

      console.log(boxes)

      setInsideBounds(boxes)
    }

    function mouseup() {
      setStartPoint(null)
      setEndPoint(null)
    }

    window.addEventListener('mousedown', mousedown)
    window.addEventListener('mousemove', mousemove)
    window.addEventListener('mouseup', mouseup)

    return () => {
      window.removeEventListener('mousedown', mousedown)
      window.removeEventListener('mousemove', mousemove)
      window.removeEventListener('mouseup', mouseup)
    }
  }, [drag, startPoint])

  return (
    <div
      ref={container}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        userSelect: 'none'
      }}
    >
      {boxes.map((box, i) =>
        <div
          className="Box"
          style={{
            width: '128px',
            height: '128px',
            margin: '1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            font: 'bold 3rem Helvetica, Arial, sans',
            backgroundColor: insideBounds.includes(box)
              ? `hsl(${i / boxes.length * 360 | 0}, 100%, 70%)`
              : '#ccc'
          }}
          data-box={box}
          key={box}
        >
          {box}
        </div>
      )}

      {startPoint && endPoint &&
        <div
          style={{
            border: '1px solid blue',
            backgroundColor: 'blue',
            opacity: 0.25,
            position: 'absolute',
            top: `${drag.minY}px`,
            left: `${drag.minX}px`,
            width: `${drag.maxX - drag.minX}px`,
            height: `${drag.maxY - drag.minY}px`
          }}
        />
      }
    </div>
  )
}
