import * as React from 'react'
import {buildBook} from 'test/generate'
import * as booksDB from 'test/data/books'
import {App} from 'app'
import userEvent from '@testing-library/user-event'
import {formatDate} from 'utils/misc'
import {
  loginAsUser,
  redirectToBookPage,
  renderWithProviders,
  waitForLoadingToFinish,
} from 'test/app-test-utils.exercise'

test('renders all the book information', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())
  redirectToBookPage(book.id)

  const {getByText, getByAltText} = renderWithProviders(<App />)

  await waitForLoadingToFinish()

  expect(getByText(book.title)).toBeInTheDocument()
  expect(getByText(book.author)).toBeInTheDocument()
  expect(getByText(book.publisher)).toBeInTheDocument()
  expect(getByText(book.synopsis)).toBeInTheDocument()
  expect(getByAltText(`${book.title} book cover`)).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
})

test('can create a list item for the book', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())
  redirectToBookPage(book.id)

  const {queryByText, getByRole, getByText} = renderWithProviders(<App />)

  await waitForLoadingToFinish()

  expect(queryByText(/mark as read/i)).not.toBeInTheDocument()
  expect(queryByText(/remove from list/i)).not.toBeInTheDocument()
  userEvent.click(getByRole('button', {name: /add to list/i}))

  await waitForLoadingToFinish()

  expect(getByText(formatDate(new Date()))).toBeInTheDocument()
  expect(getByRole('button', {name: /mark as read/i})).toBeInTheDocument()
  expect(getByRole('button', {name: /remove from list/i})).toBeInTheDocument()
  expect(queryByText(/add to list/i)).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())
  redirectToBookPage(book.id)

  const {queryByRole, getByRole, getByText} = renderWithProviders(<App />)

  await waitForLoadingToFinish()

  expect(queryByRole('button', {name: /mark as read/i})).not.toBeInTheDocument()
  expect(
    queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  userEvent.click(getByRole('button', {name: /add to list/i}))

  await waitForLoadingToFinish()

  expect(getByText(formatDate(new Date()))).toBeInTheDocument()
  expect(getByRole('button', {name: /mark as read/i})).toBeInTheDocument()
  userEvent.click(getByRole('button', {name: /remove from list/i}))

  await waitForLoadingToFinish()
  expect(getByRole('button', {name: /add to list/i})).toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())
  redirectToBookPage(book.id)

  const {queryByRole, getByRole, getByText} = renderWithProviders(<App />)

  await waitForLoadingToFinish()

  expect(queryByRole('button', {name: /mark as read/i})).not.toBeInTheDocument()
  expect(
    queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
  userEvent.click(getByRole('button', {name: /add to list/i}))

  await waitForLoadingToFinish()

  expect(getByText(formatDate(new Date()))).toBeInTheDocument()
  userEvent.click(getByRole('button', {name: /mark as read/i}))

  await waitForLoadingToFinish()
  expect(getByRole('button', {name: /mark as unread/i})).toBeInTheDocument()
})

test('can edit a note', async () => {
  await loginAsUser()

  const book = await booksDB.create(buildBook())
  redirectToBookPage(book.id)

  const {findByLabelText, getByRole} = renderWithProviders(<App />)

  await waitForLoadingToFinish()

  userEvent.click(getByRole('button', {name: /add to list/i}))

  await waitForLoadingToFinish()

  const notesTextArea = getByRole('textbox', {name: /note/i})

  userEvent.type(notesTextArea, 'test note')

  expect(notesTextArea).toHaveValue('test note')
  await findByLabelText('loading')

  userEvent.clear(notesTextArea)

  await waitForLoadingToFinish()

  expect(notesTextArea).toHaveValue('')
})
