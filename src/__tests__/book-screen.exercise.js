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

const renderBookScreen = async (options = {}) => {
  const user = await loginAsUser(options.user)
  const book = options.book || (await booksDB.create(buildBook()))
  redirectToBookPage(book.id)
  const utils = renderWithProviders(<App />)
  await waitForLoadingToFinish()
  return {user, book, ...utils}
}
test('renders all the book information', async () => {
  const {book, getByText, getByAltText} = await renderBookScreen(<App />)

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
  const {queryByText, getByRole, getByText} = await renderBookScreen(<App />)

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
  const {queryByRole, getByRole, getByText} = await renderBookScreen(<App />)

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
  const {queryByRole, getByRole, getByText} = await renderBookScreen(<App />)

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
  // since we have debounce on the notes input
  jest.useFakeTimers()

  const {findByLabelText, getByRole} = await renderBookScreen(<App />)

  userEvent.click(getByRole('button', {name: /add to list/i}))

  // wait for loading indicator to finish
  await waitForLoadingToFinish()

  const notesTextArea = getByRole('textbox', {name: /note/i})

  userEvent.type(notesTextArea, 'test note')

  expect(notesTextArea).toHaveValue('test note')
  // wait for loading indicator to show since we are editing the notes
  await findByLabelText('loading')

  userEvent.clear(notesTextArea)

  await waitForLoadingToFinish()

  expect(notesTextArea).toHaveValue('')
})
