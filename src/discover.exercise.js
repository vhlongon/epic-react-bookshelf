/** @jsx jsx */
import {jsx} from '@emotion/core'

import './bootstrap'
import Tooltip from '@reach/tooltip'
import {FaSearch, FaTimes} from 'react-icons/fa'
import {Input, BookListUL, Spinner} from './components/lib'
import {BookRow} from './components/book-row'
import {useEffect, useState} from 'react'
import {client} from './utils/api-client'
import {danger} from 'styles/colors'
import {useAsync} from 'utils/hooks.exercise'

const getIcon = (isLoading, isError) => {
  if (isLoading) {
    return <Spinner />
  }
  if (isError) {
    return <FaTimes aria-label="error" color={danger} />
  }

  return <FaSearch aria-label="search" />
}
function DiscoverBooksScreen() {
  const {data, errorMessage, run, isLoading, isError, isSuccess} = useAsync()
  const [query, setQuery] = useState()

  useEffect(() => {
    if (!query) {
      return
    }
    run(client('books', {query}))
  }, [query, run])

  function handleSearchSubmit(event) {
    event.preventDefault()
    const {search} = event.target.elements
    setQuery(search.value)
  }

  return (
    <div
      css={{maxWidth: 800, margin: 'auto', width: '90vw', padding: '40px 0'}}
    >
      <form onSubmit={handleSearchSubmit}>
        <Input
          placeholder="Search books..."
          id="search"
          css={{width: '100%'}}
        />
        <Tooltip label="Search Books">
          <label htmlFor="search">
            <button
              type="submit"
              css={{
                border: '0',
                position: 'relative',
                marginLeft: '-35px',
                background: 'transparent',
              }}
            >
              {getIcon(isLoading, isError)}
            </button>
          </label>
        </Tooltip>
      </form>

      {isSuccess ? (
        data?.books?.length ? (
          <BookListUL css={{marginTop: 20}}>
            {data.books.map(book => (
              <li key={book.id} aria-label={book.title}>
                <BookRow key={book.id} book={book} />
              </li>
            ))}
          </BookListUL>
        ) : (
          <p>No books found. Try another search.</p>
        )
      ) : null}
      {isError ? (
        <div css={{color: danger}}>
          <div css={{display: 'flex', alignItems: 'center'}}>
            <p css={{lineHeight: 1}}>There was an error:</p>
          </div>
          <pre>{errorMessage}</pre>
        </div>
      ) : null}
    </div>
  )
}

export {DiscoverBooksScreen}
