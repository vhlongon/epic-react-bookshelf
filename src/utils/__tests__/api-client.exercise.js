import {queryCache} from 'react-query'
import * as auth from 'auth-provider'
import {server, rest} from 'test/server'
import {client} from '../api-client'

jest.mock('react-query')
jest.mock('auth-provider')

const apiURL = process.env.REACT_APP_API_URL

test('calls fetch at the endpoint with the arguments for GET requests', async () => {
  const endpoint = 'test-endpoint'
  const mockResult = {mockValue: 'VALUE'}
  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.json(mockResult))
    }),
  )

  const result = await client(endpoint)

  expect(result).toEqual(mockResult)
})

test('adds auth token when a token is provided', async () => {
  const token = 'token'
  const mockResult = {mockValue: 'VALUE'}
  const endpoint = 'test-endpoint'
  let request

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  await client(endpoint, {token})
  expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`)
})

test('allows for config overrides', async () => {
  const token = 'token'
  const mockResult = {mockValue: 'VALUE'}
  const endpoint = 'test-endpoint'
  const headers = {'Content-Type': 'fake-type'}
  const customConfig = {
    mode: 'cors',
  }
  let request

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockResult))
    }),
  )

  await client(endpoint, {token, headers, ...customConfig})
  expect(request.headers.get('Content-Type')).toBe('fake-type')
  expect(request.mode).toBe('cors')
})

test('when data is provided, it is stringified and the method defaults to POST', async () => {
  const mockData = {mockValue: 'VALUE'}
  const endpoint = 'test-endpoint'
  let request

  server.use(
    rest.post(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      request = req
      return res(ctx.json(mockData))
    }),
  )

  await client(endpoint, {data: mockData})

  expect(request.body).toEqual(mockData)
})

test('when request fails returns promise with error data', async () => {
  const endpoint = 'test-endpoint'
  const errorData = {message: 'this is the response!'}

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(400), ctx.json(errorData))
    }),
  )

  await expect(client(endpoint)).rejects.toEqual(errorData)
})

test('when request fails returns promise with error data', async () => {
  const mockClearCache = jest.fn()

  jest.mock('react-query', () => {
    const reactQuery = require.requireActual('react-query')
    return {
      ...reactQuery,
      queryCache: {clear: mockClearCache},
    }
  })

  const endpoint = 'test-endpoint'

  server.use(
    rest.get(`${apiURL}/${endpoint}`, async (req, res, ctx) => {
      return res(ctx.status(401), ctx.json({}))
    }),
  )

  await expect(client(endpoint)).rejects.toEqual({
    message: 'Please re-authenticate.',
  })

  expect(queryCache.clear).toHaveBeenCalled()
  expect(auth.logout).toHaveBeenCalled()
})
