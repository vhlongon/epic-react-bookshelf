import {queryCache} from 'react-query'
import {client} from './api-client.exercise'

export const refetchBookSearchQuery = user => {
  queryCache.removeQueries(['bookSearch'])
  queryCache.prefetchQuery({
    queryKey: ['bookSearch', {query: ''}],
    queryFn: () =>
      client(`books?query=${encodeURIComponent('')}`, {
        token: user.token,
      }).then(data => data.books),
  })
}
