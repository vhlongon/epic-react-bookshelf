/** @jsx jsx */
import {jsx} from '@emotion/core'
import * as React from 'react'
import * as auth from 'auth-provider'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {client} from 'utils/api-client.exercise'
import {FullPageSpinner} from './components/lib'
import {useAsync} from './utils/hooks'
import {danger} from './styles/colors'

const getUser = async () => {
  const token = await auth.getToken()
  if (token) {
    const user = await client('me', {
      token,
    })

    return user
  }
}

function App() {
  const {
    data: user,
    error,
    isIdle,
    isLoading,
    isError,
    run,
    setData,
  } = useAsync()

  React.useEffect(() => {
    run(getUser())
  }, [run])

  const login = form => auth.login(form).then(u => setData(u))
  const logout = () => {
    auth.logout()
    setData(null)
  }
  const register = form => auth.register(form).then(u => setData(u))

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return (
      <div
        css={{
          color: danger,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>Uh oh... There's a problem. Try refreshing the app.</p>
        <pre>{error.message}</pre>
      </div>
    )
  }

  if (user) {
    return <AuthenticatedApp user={user} logout={logout} />
  }

  return <UnauthenticatedApp login={login} register={register} />
}

export {App}
