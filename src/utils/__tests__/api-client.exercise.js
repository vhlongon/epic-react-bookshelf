import {server, rest} from 'test/server'
import {client} from '../api-client'

const apiURL = process.env.REACT_APP_API_URL

// enable API mocking in test runs using the same request handlers
// as for the client-side mocking.
beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

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
