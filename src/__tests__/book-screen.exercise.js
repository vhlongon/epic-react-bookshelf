import * as React from 'react'
import {buildBook, buildListItem} from 'test/generate'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {App} from 'app'
import userEvent from '@testing-library/user-event'
import {formatDate} from 'utils/misc'
import {
  loginAsUser,
  redirectToBookPage,
  renderWithProviders,
  waitForLoadingToFinish,
} from 'test/app-test-utils.exercise'
import {screen} from '@testing-library/react'
import {server, rest} from 'test/server'

const renderBookScreen = async (options = {}) => {
  const user = await loginAsUser(options.user)
  const book = options.book ?? (await booksDB.create(buildBook()))
  redirectToBookPage(book.id)
  const listItem =
    options.listItem ??
    (await listItemsDB.create(buildListItem({owner: user, book})))

  const utils = renderWithProviders(<App />)
  await waitForLoadingToFinish()
  return {user, book, listItem, ...utils}
}
test('renders all the book information', async () => {
  const {book, getByText, getByAltText} = await renderBookScreen()

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
  const {queryByText, getByRole, getByText} = await renderBookScreen()

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
  const {queryByRole, getByRole, getByText} = await renderBookScreen()

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
  const {queryByRole, getByRole, getByText} = await renderBookScreen()

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

  const {findByLabelText, getByRole} = await renderBookScreen()

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

describe('errors', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  test('shows an error message when the book fails to load', async () => {
    const book = {id: 'BAD_ID'}

    try {
      await renderBookScreen({listItem: null, book})

      expect(await screen.findByRole('alert')).toThrow(
        'No book found with the ID of BAD_ID',
      )
    } catch (error) {}
  })

  test('note update failures are displayed', async () => {
    jest.useFakeTimers()
    const apiURL = process.env.REACT_APP_API_URL
    const testErrorMessage = '__test_error_message__'
    server.use(
      rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({status: 400, message: testErrorMessage}),
        )
      }),
    )
    const {getByRole} = await renderBookScreen()

    userEvent.click(getByRole('button', {name: /add to list/i}))

    // wait for loading indicator to finish
    await waitForLoadingToFinish()

    const notesTextArea = getByRole('textbox', {name: /note/i})

    userEvent.type(notesTextArea, 'test note')

    try {
      expect(screen.getByRole('alert').textContent).toThrow(
        `"There was an error: __test_error_message__"`,
      )
    } catch (error) {}
  })
})
