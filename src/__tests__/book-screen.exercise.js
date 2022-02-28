import * as React from 'react'
import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import {queryCache} from 'react-query'
import {buildUser, buildBook} from 'test/generate'
import * as auth from 'auth-provider'
import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {AppProviders} from 'context'
import {App} from 'app'
import userEvent from '@testing-library/user-event'
import {formatDate} from 'utils/misc'

afterEach(async () => {
  queryCache.clear()
  await auth.logout()
  await usersDB.reset()
  await booksDB.reset()
  await listItemsDB.reset()
})

test('renders all the book information', async () => {
  const fakeToken = 'fakeToken'
  window.localStorage.setItem(auth.localStorageKey, fakeToken)

  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  window.history.pushState({}, 'books', route)

  render(<App />, {
    wrapper: AppProviders,
  })

  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByAltText(/loading/i),
  ])

  expect(screen.getByText(book.title)).toBeInTheDocument()
  expect(screen.getByText(book.author)).toBeInTheDocument()
  expect(screen.getByText(book.publisher)).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByAltText(`${book.title} book cover`)).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
})

test('can create a list item for the book', async () => {
  const fakeToken = 'fakeToken'
  window.localStorage.setItem(auth.localStorageKey, fakeToken)

  const user = buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)

  const book = await booksDB.create(buildBook())
  const route = `/book/${book.id}`
  window.history.pushState({}, 'books', route)

  render(<App />, {
    wrapper: AppProviders,
  })

  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByAltText(/loading/i),
  ])

  expect(screen.queryByText(/mark as read/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/remove from list/i)).not.toBeInTheDocument()
  userEvent.click(screen.getByRole('button', {name: /add to list/i}))

  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByAltText(/loading/i),
  ])

  expect(screen.getByText(formatDate(new Date()))).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /mark as read/i}),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(screen.queryByText(/add to list/i)).not.toBeInTheDocument()
})
