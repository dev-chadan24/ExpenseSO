import React, { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

export default function CountUp({ value, formatter, duration = 0.8 }) {
  const nodeRef = useRef()
  const lastValueRef = useRef(0)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const targetValue = parseFloat(value)
    if (isNaN(targetValue)) {
      node.textContent = value
      return
    }

    const controls = animate(lastValueRef.current, targetValue, {
      duration,
      ease: [0.16, 1, 0.3, 1], // premium custom cubic-bezier (out-quart)
      onUpdate(latest) {
        node.textContent = formatter ? formatter(latest) : latest.toFixed(2)
      },
    })

    lastValueRef.current = targetValue
    return () => controls.stop()
  }, [value, formatter, duration])

  return <span ref={nodeRef} className="font-display font-bold" />
}
