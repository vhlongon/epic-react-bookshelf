import {logout} from 'auth-provider'

const apiURL = process.env.REACT_APP_API_URL

async function client(endpoint, {token, data, ...customConfig} = {}) {
  const config = {
    method: data ? 'POST' : 'GET',
    headers: token ? {Authorization: `Bearer ${token}`} : undefined,
    body: data ? JSON.stringify(data) : undefined,
    ...customConfig,
  }

  const response = await window.fetch(`${apiURL}/${endpoint}`, config)
  if (response.status === 401) {
    await logout()
    window.location.assign(window.location)
    return Promise.reject({message: 'Please re-authenticate.'})
  }
  const responseData = await response.json()
  if (response.ok) {
    return responseData
  } else {
    return Promise.reject(responseData)
  }
}

export {client}
