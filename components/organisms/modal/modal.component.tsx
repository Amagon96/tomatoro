import { AnimatePresence } from 'framer-motion'
import React, { FC, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Heading, Paragraph } from 'theme-ui'
import { useEventListener, useOnClickOutside, useScrollLock } from 'usehooks-ts'

import {
  Backdrop,
  CloseButton,
  MotionModal,
} from '~/components/organisms/modal/modal.styles'

interface Props {
  show: boolean
  setToggled: () => void
  data?: {
    title: string
    message?: string
  }
  children?: React.ReactNode
  dark?: boolean
}

const ModalComponent: FC<Props> = ({
  children,
  dark,
  data,
  setToggled,
  show,
}) => {
  const modalRef = useRef(null)
  const { lock, unlock } = useScrollLock()

  const onEscKey = (event: { key: string }) => {
    if (event.key === 'Escape') {
      setToggled()
    }
  }

  useEventListener('keyup', onEscKey, modalRef)

  useEffect(() => {
    show && lock()
    return () => unlock()
  }, [lock, show, unlock])

  useOnClickOutside(modalRef, () => {
    setToggled()
  })

  return (
    <AnimatePresence>
      { show && (
        <>
          <Backdrop/>
          <MotionModal
            dark={dark}
            ref={ modalRef }
            initial={ { y: 10, x: '-50%', opacity: 0 } }
            animate={ { y: 50, opacity: 1 } }
            exit={ { y: 100, opacity: 0 } }
          >
            <CloseButton onClick={ setToggled }/>
            { data?.title && <Heading>{ data.title }</Heading> }
            { data?.message && <Paragraph>{ data.message }</Paragraph> }
            { children }
          </MotionModal>
        </>
      ) }
    </AnimatePresence>
  )
}

export const Modal: FC<Props> = (props) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    return () => setMounted(false)
  }, [])

  return mounted
    ? createPortal(
      <ModalComponent { ...props } />,
      document.querySelector('#modal-portal')!,
    )
    : null
}
