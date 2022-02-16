/** @jsx jsx */
import {jsx} from '@emotion/core'

import {FullPageSpinner, FullPageErrorFallback} from './components/lib'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {useAuth} from 'context/auth-context'

function App() {
  const {user, error, isLoading, isIdle, isError, isSuccess} = useAuth()
  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  if (isSuccess) {
    return user ? <AuthenticatedApp /> : <UnauthenticatedApp />
  }
}

export {App}
