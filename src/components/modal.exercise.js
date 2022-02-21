/** @jsx jsx */
import {jsx} from '@emotion/core'

import VisuallyHidden from '@reach/visually-hidden'
import React from 'react'
import {CircleButton, Dialog} from './lib'

const ModalContext = React.createContext()

export const Modal = ({children, initialOpen = false}) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen)

  return (
    <ModalContext.Provider value={{isOpen, setIsOpen}}>
      {children}
    </ModalContext.Provider>
  )
}

export const ModalDismissButton = ({children}) => {
  const {setIsOpen} = React.useContext(ModalContext)
  return (
    <div>
      {React.cloneElement(children, {
        onClick: () => {
          children.props?.onClick()
          setIsOpen(false)
        },
      })}
    </div>
  )
}

export const ModalOpenButton = ({children}) => {
  const {setIsOpen} = React.useContext(ModalContext)
  return (
    <div>
      {React.cloneElement(children, {
        onClick: () => {
          children.props?.onClick()
          return setIsOpen(true)
        },
      })}
    </div>
  )
}

export const ModalContentsBase = props => {
  const {isOpen, setIsOpen} = React.useContext(ModalContext)
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props} />
  )
}

export const ModalContents = ({children, title, ...props}) => {
  return (
    <ModalContentsBase {...props}>
      <div css={{display: 'flex', justifyContent: 'flex-end'}}>
        <ModalDismissButton>
          <CircleButton
            onClick={() => console.log(`closing the ${title} modal`)}
          >
            <VisuallyHidden>Close</VisuallyHidden>
            <span aria-hidden>×</span>
          </CircleButton>
        </ModalDismissButton>
      </div>
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentsBase>
  )
}
