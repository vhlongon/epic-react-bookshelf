import {renderHook, act} from '@testing-library/react-hooks'
import {useAsync} from '../hooks'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

test('calling run with a promise which resolves', async () => {
  const {promise, resolve} = deferred()

  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual({
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })

  act(() => {
    result.current.run(promise)
  })

  expect(result.current).toMatchObject({
    status: 'pending',
    isLoading: true,
  })

  const data = {
    a: 'a',
  }

  await act(async () => {
    resolve(data)
    await promise
  })

  expect(result.current).toMatchObject({
    status: 'resolved',
    isLoading: false,
    data,
  })

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual({
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })
})

test('calling run with a promise which rejects', async () => {
  const {promise, reject} = deferred()

  const {result} = renderHook(() => useAsync())

  expect(result.current).toEqual({
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })

  act(() => {
    result.current.run(promise).catch(() => {})
  })

  expect(result.current).toMatchObject({
    status: 'pending',
    isLoading: true,
  })

  const error = {
    a: 'a',
  }

  await act(async () => {
    reject(error)
    await promise.catch(() => {})
  })

  expect(result.current).toMatchObject({
    status: 'rejected',
    isLoading: false,
    error,
  })

  act(() => {
    result.current.reset()
  })

  expect(result.current).toEqual({
    isIdle: true,
    isLoading: false,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: null,
    status: 'idle',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })
})

test('can specify an initial state', () => {
  const initialState = {
    status: 'pending',
    error: [],
  }

  const {result} = renderHook(() => useAsync(initialState))

  expect(result.current).toEqual({
    isIdle: false,
    isLoading: true,
    isError: false,
    isSuccess: false,
    setData: expect.any(Function),
    setError: expect.any(Function),
    error: [],
    status: 'pending',
    data: null,
    run: expect.any(Function),
    reset: expect.any(Function),
  })
})

test('can set the data', () => {
  const {result} = renderHook(() => useAsync())

  act(() => {
    result.current.setData('data')
  })

  expect(result.current.data).toBe('data')
})

test('can set the error', () => {
  const {result} = renderHook(() => useAsync())

  act(() => {
    result.current.setError('oops')
  })

  expect(result.current.error).toBe('oops')
})

test('No state updates happen if the component is unmounted while pending', () => {
  const {unmount} = renderHook(() => useAsync())
  jest.spyOn(console, 'error')

  unmount()

  expect(console.error).not.toHaveBeenCalled()
})

test('calling "run" without a promise results in an early error', () => {
  const {result} = renderHook(() => useAsync())
  const notAPromise = jest.fn()
  try {
    act(() => {
      expect(result.current.run(notAPromise)).toThrow(
        `The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?`,
      )
    })
  } catch (error) {}
})
