import * as React from 'react'
import {useAuth} from './context/auth-context'
import {FullPageSpinner} from './components/lib'

const AuthenticatedApp = React.lazy(() =>
  import(
    /* webpackChunkName: "authenticated-app" */
    /* webpackPrefetch: true */
    './authenticated-app.exercise'
  ),
)
const UnauthenticatedApp = React.lazy(() =>
  import(
    /* webpackChunkName: "unauthenticated-app" */
    './unauthenticated-app.exercise'
  ),
)

function App() {
  const {user} = useAuth()
  return (
    <React.Suspense fallback={<FullPageSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  )
}

export {App}
