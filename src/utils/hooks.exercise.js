import {useCallback, useState} from 'react'

export const useAsync = () => {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState(null)

  const run = useCallback(fetcher => {
    setStatus('loading')
    fetcher
      .then(data => {
        setData(data)
        setStatus('success')
      })
      .catch(error => {
        setErrorMessage(error)
        setStatus('error')
      })
  }, [])

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  return {
    run,
    data,
    status,
    isLoading,
    isSuccess,
    isError,
    errorMessage,
  }
}
