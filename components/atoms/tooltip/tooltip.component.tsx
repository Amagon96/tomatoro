import React, { FC, ReactNode, useId, useState, useRef, useEffect } from 'react'
import { Box } from 'theme-ui'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: Placement
  offset?: number // gap between trigger and tooltip
  maxWidth?: string | number
}

/**
 * Simple accessible tooltip using theme-ui.
 * Shows on hover and focus. Dismisses on escape or blur.
 * Arrow is rendered outside the bubble and matched to background.
 */
export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  maxWidth = 360,
  offset = 8,
  placement = 'top',
}) => {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()
  const triggerRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const bgColor = 'rgba(0,0,0,0.85)'
  const arrowSize = 8

  // close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false)
      }
    }
    if (visible) {
      window.addEventListener('keydown', onKey)
    }
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [visible])

  // close when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setVisible(false)
      }
    }
    if (visible) {
      document.addEventListener('mousedown', onClick)
    }
    return () => {
      document.removeEventListener('mousedown', onClick)
    }
  }, [visible])

  const getTooltipPosition = (): Record<string, string> => {
    switch (placement) {
      case 'top':
        return {
          bottom: `calc(100% + ${ offset }px)`,
          left: '50%',
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        return {
          top: `calc(100% + ${ offset }px)`,
          left: '50%',
          transform: 'translateX(-50%)',
        }
      case 'left':
        return {
          right: `calc(100% + ${ offset }px)`,
          top: '50%',
          transform: 'translateY(-50%)',
        }
      case 'right':
      default:
        return {
          left: `calc(100% + ${ offset }px)`,
          top: '50%',
          transform: 'translateY(-50%)',
        }
    }
  }

  const getArrowContainerStyles = (): Record<string, string> => {
    switch (placement) {
      case 'top':
        return {
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '6px', // increased gap so arrow is further outside
          width: `${ arrowSize * 2 }px`,
          height: `${ arrowSize }px`,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }
      case 'bottom':
        return {
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '6px',
          width: `${ arrowSize * 2 }px`,
          height: `${ arrowSize }px`,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }
      case 'left':
        return {
          position: 'absolute',
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '6px',
          width: `${ arrowSize }px`,
          height: `${ arrowSize * 2 }px`,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }
      case 'right':
      default:
        return {
          position: 'absolute',
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: '6px',
          width: `${ arrowSize }px`,
          height: `${ arrowSize * 2 }px`,
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }
    }
  }

  const getArrowShapeStyles = (): Record<string, string> => {
    switch (placement) {
      case 'top':
        // arrow pointing down
        return {
          width: '0',
          height: '0',
          borderLeft: `${ arrowSize }px solid transparent`,
          borderRight: `${ arrowSize }px solid transparent`,
          borderTop: `${ arrowSize }px solid ${ bgColor }`,
        }
      case 'bottom':
        // arrow pointing up
        return {
          width: '0',
          height: '0',
          borderLeft: `${ arrowSize }px solid transparent`,
          borderRight: `${ arrowSize }px solid transparent`,
          borderBottom: `${ arrowSize }px solid ${ bgColor }`,
        }
      case 'left':
        // arrow pointing right
        return {
          width: '0',
          height: '0',
          borderTop: `${ arrowSize }px solid transparent`,
          borderBottom: `${ arrowSize }px solid transparent`,
          borderLeft: `${ arrowSize }px solid ${ bgColor }`,
        }
      case 'right':
      default:
        // arrow pointing left
        return {
          width: '0',
          height: '0',
          borderTop: `${ arrowSize }px solid transparent`,
          borderBottom: `${ arrowSize }px solid transparent`,
          borderRight: `${ arrowSize }px solid ${ bgColor }`,
        }
    }
  }

  // clone child to attach interaction props
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement, {
      ref: (node: HTMLElement) => {
        const origRef = (children as any).ref
        if (typeof origRef === 'function') {
          origRef(node)
        } else if (origRef && typeof origRef === 'object') {
          ;(origRef as any).current = node
        }
        triggerRef.current = node
      },
      onMouseEnter: (e: React.MouseEvent) => {
        setVisible(true)
        const orig = (children as any).props.onMouseEnter
        if (orig) {
          orig(e)
        }
      },
      onMouseLeave: (e: React.MouseEvent) => {
        setVisible(false)
        const orig = (children as any).props.onMouseLeave
        if (orig) {
          orig(e)
        }
      },
      onFocus: (e: React.FocusEvent) => {
        setVisible(true)
        const orig = (children as any).props.onFocus
        if (orig) {
          orig(e)
        }
      },
      onBlur: (e: React.FocusEvent) => {
        setVisible(false)
        const orig = (children as any).props.onBlur
        if (orig) {
          orig(e)
        }
      },
      'aria-describedby': tooltipId,
    })
    : (
      <Box
        as="span"
        ref={ (node: any) => {
          triggerRef.current = node
        } }
        onMouseEnter={ () => setVisible(true) }
        onMouseLeave={ () => setVisible(false) }
        onFocus={ () => setVisible(true) }
        onBlur={ () => setVisible(false) }
        aria-describedby={ tooltipId }
        tabIndex={ 0 }
        sx={ { display: 'inline-flex' } }
      >
        { children }
      </Box>
    )

  return (
    <Box sx={ { position: 'relative', display: 'inline-block' } }>
      { child }
      { visible && (
        <Box
          ref={ (r) => {
            tooltipRef.current = r
          } }
          id={ tooltipId }
          role="tooltip"
          aria-live="polite"
          sx={ {
            position: 'absolute',
            zIndex: 1000,
            pointerEvents: 'auto',
            bg: bgColor,
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: 4,
            fontSize: 1,
            lineHeight: 1.2,
            maxWidth,
            minWidth: 220,
            whiteSpace: 'normal',
            ...getTooltipPosition(),
          } }
        >
          <Box sx={ { position: 'relative' } }>
            { content }
            <Box sx={ getArrowContainerStyles() }>
              <Box sx={ getArrowShapeStyles() }/>
            </Box>
          </Box>
        </Box>
      ) }
    </Box>
  )
}
