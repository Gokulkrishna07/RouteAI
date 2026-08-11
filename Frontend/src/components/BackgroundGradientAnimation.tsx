import { useEffect, useRef } from 'react'
import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { colors } from '../constants'
import './BackgroundGradientAnimation.css'

interface BackgroundGradientAnimationProps {
  children?: ReactNode
  interactive?: boolean
  className?: string
}

function BackgroundGradientAnimation({
  children,
  interactive = true,
  className = '',
}: BackgroundGradientAnimationProps) {
  const interactiveRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ curX: 0, curY: 0, tgX: 0, tgY: 0 })

  useEffect(() => {
    if (!interactive) return

    let frame: number
    const animate = () => {
      const p = pos.current
      p.curX += (p.tgX - p.curX) / 20
      p.curY += (p.tgY - p.curY) / 20
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate(${Math.round(p.curX)}px, ${Math.round(p.curY)}px)`
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [interactive])

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactiveRef.current) return
    const rect = interactiveRef.current.getBoundingClientRect()
    pos.current.tgX = event.clientX - rect.left
    pos.current.tgY = event.clientY - rect.top
  }

  const cssVars = {
    '--gradient-bg-start': colors.gradientStart,
    '--gradient-bg-end': colors.gradientEnd,
    '--blob-first': colors.blobFirst,
    '--blob-second': colors.blobSecond,
    '--blob-third': colors.blobThird,
    '--blob-fourth': colors.blobFourth,
    '--blob-fifth': colors.blobFifth,
    '--blob-pointer': colors.blobPointer,
  } as CSSProperties

  return (
    <div className={`gradient-animation-container ${className}`} style={cssVars} onMouseMove={handleMouseMove}>
      <div className="gradient-blobs">
        <div className="gradient-blob blob-first" />
        <div className="gradient-blob blob-second" />
        <div className="gradient-blob blob-third" />
        <div className="gradient-blob blob-fourth" />
        <div className="gradient-blob blob-fifth" />
        {interactive && <div ref={interactiveRef} className="gradient-blob blob-pointer" />}
      </div>
      <div className="gradient-animation-content">{children}</div>
    </div>
  )
}

export default BackgroundGradientAnimation
