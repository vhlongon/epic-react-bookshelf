import {queryCache} from 'react-query'

export const refetchBookSearchQuery = async () => {
  await queryCache.removeQueries(['bookSearch'])
  await queryCache.prefetchQuery('bookSearch')
}
