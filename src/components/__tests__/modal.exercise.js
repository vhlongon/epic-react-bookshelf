import React from 'react'
import {
  ModalOpenButton,
  Modal,
  ModalDismissButton,
  ModalContents,
} from '../modal'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('can be opened and closed', () => {
  render(
    <Modal>
      <ModalDismissButton>
        <button>close</button>
      </ModalDismissButton>
      <ModalContents aria-label="test-form" title="title">
        content
      </ModalContents>
      <ModalOpenButton>
        <button>open</button>
      </ModalOpenButton>
    </Modal>,
  )

  userEvent.click(screen.getByText('open'))

  const modal = screen.getByRole('dialog')
  expect(within(modal).getByText('content')).toBeInTheDocument()
  expect(within(modal).getByText('title')).toBeInTheDocument()
  expect(modal).toHaveAttribute('aria-label', 'test-form')

  userEvent.click(screen.getByText('close'))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
