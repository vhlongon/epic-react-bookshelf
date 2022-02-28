import {render, screen, waitForElementToBeRemoved} from '@testing-library/react'
import * as auth from 'auth-provider'
import * as usersDB from 'test/data/users'
import {buildUser} from 'test/generate'
import {AppProviders} from '../context'

export const renderWithProviders = (ui, options) =>
  render(ui, {wrapper: AppProviders, ...options})

export const waitForLoadingToFinish = async () => {
  await waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

export const loginAsUser = async initialUser => {
  const fakeToken = 'fakeToken'
  window.localStorage.setItem(auth.localStorageKey, fakeToken)

  const user = initialUser || buildUser()
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  window.localStorage.setItem(auth.localStorageKey, authUser.token)
  return user
}

export const redirectToBookPage = async bookId => {
  const route = `/book/${bookId}`
  window.history.pushState({}, 'Test page', route)
}
