import '@testing-library/jest-dom'
import {server} from 'test/server'
import {queryCache} from 'react-query';
import * as auth from 'auth-provider'
import * as usersDB from 'test/data/users'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

afterEach(async () => {
  queryCache.clear()
  await auth.logout()
  await usersDB.reset()
  await booksDB.reset()
  await listItemsDB.reset()
})