import * as React from 'react'
import {useQuery, queryCache, useMutation} from 'react-query'
import {client} from './api-client.exercise'

function useSafeDispatch(dispatch) {
  const mounted = React.useRef(false)
  React.useLayoutEffect(() => {
    mounted.current = true
    return () => (mounted.current = false)
  }, [])
  return React.useCallback(
    (...args) => (mounted.current ? dispatch(...args) : void 0),
    [dispatch],
  )
}

// Example usage:
// const {data, error, status, run} = useAsync()
// React.useEffect(() => {
//   run(fetchPokemon(pokemonName))
// }, [pokemonName, run])
const defaultInitialState = {status: 'idle', data: null, error: null}
export function useAsync(initialState) {
  const initialStateRef = React.useRef({
    ...defaultInitialState,
    ...initialState,
  })
  const [{status, data, error}, setState] = React.useReducer(
    (s, a) => ({...s, ...a}),
    initialStateRef.current,
  )

  const safeSetState = useSafeDispatch(setState)

  const setData = React.useCallback(
    data => safeSetState({data, status: 'resolved'}),
    [safeSetState],
  )
  const setError = React.useCallback(
    error => safeSetState({error, status: 'rejected'}),
    [safeSetState],
  )
  const reset = React.useCallback(
    () => safeSetState(initialStateRef.current),
    [safeSetState],
  )

  const run = React.useCallback(
    promise => {
      if (!promise || !promise.then) {
        throw new Error(
          `The argument passed to useAsync().run must be a promise. Maybe a function that's passed isn't returning anything?`,
        )
      }
      safeSetState({status: 'pending'})
      return promise.then(
        data => {
          setData(data)
          return data
        },
        error => {
          setError(error)
          return Promise.reject(error)
        },
      )
    },
    [safeSetState, setData, setError],
  )

  return {
    // using the same names that react-query uses for convenience
    isIdle: status === 'idle',
    isLoading: status === 'pending',
    isError: status === 'rejected',
    isSuccess: status === 'resolved',

    setData,
    setError,
    error,
    status,
    data,
    run,
    reset,
  }
}

export const useBook = (bookId, user) => {
  const result = useQuery({
    queryKey: ['book', {bookId}],
    queryFn: () =>
      client(`books/${bookId}`, {token: user.token}).then(data => data.book),
  })

  return result
}

const setBookData = book => {
  queryCache.setQueryData(['book', {bookId: book.id}], book)
}
export const useBookSearch = (query, user) => {
  const result = useQuery({
    queryKey: ['bookSearch', {query}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent(query)}`, {
        token: user.token,
      }).then(data => data.books),
    config: {
      onSuccess: books => {
        if (books.length <= 0) {
          return
        }

        for (const book of books) {
          setBookData(book)
        }
      },
    },
  })

  return result
}

export const useListItems = user => {
  const result = useQuery({
    queryKey: 'list-items',
    queryFn: () =>
      client(`list-items`, {token: user.token}).then(data => data.listItems),
    config: {
      onSuccess: listItems => {
        if (listItems.length <= 0) {
          return
        }

        for (const listItem of listItems) {
          setBookData(listItem.book)
        }
      },
    },
  })

  return result
}

export const useListItem = (user, bookId) => {
  const {data: listItems} = useListItems(user)

  return listItems?.find(li => li.bookId === bookId) ?? null
}

const defaultMutationConfig = {
  onSettled: () => {
    // trigger refetch of list items
    queryCache.invalidateQueries('list-items')
  },
}

export const useUpdateListItem = (user, config = {throwOnError: true}) => {
  const result = useMutation(
    updates =>
      client(`list-items/${updates.id}`, {
        method: 'PUT',
        data: updates,
        token: user.token,
      }),
    {
      onMutate: async updatedListItem => {
        await queryCache.cancelQueries('list-items')

        // get current Data
        const currentData = queryCache.getQueryData('list-items')

        // perform optimistic update
        queryCache.setQueryData('list-items', oldData => {
          return oldData.map(item => {
            if (item.id === updatedListItem.id) {
              return {...item, ...updatedListItem}
            }
            return item
          })
        })

        return currentData
      },

      onError: (err, variables, onMutateValue) => {
        // restore original value returned by onMutate
        queryCache.setQueryData('list-items', onMutateValue)
      },
      ...defaultMutationConfig,
      ...config,
    },
  )

  return result
}

export const useRemoveListItem = (user, config = {throwOnError: true}) => {
  const result = useMutation(
    ({id}) => client(`list-items/${id}`, {method: 'DELETE', token: user.token}),
    {...defaultMutationConfig, ...config},
  )
  return result
}

export const useCreateListItem = (user, config = {throwOnError: true}) => {
  const result = useMutation(
    ({bookId}) => client(`list-items`, {data: {bookId}, token: user.token}),
    {...defaultMutationConfig, ...config},
  )

  return result
}
