export function client(endpoint, customConfig = {}) {
  const config = {
    method: 'GET',
    query: '',
    ...customConfig,
  }

  return new Promise((resolve, reject) => {
    window
      .fetch(
        `${
          process.env.REACT_APP_API_URL
        }/${endpoint}?query=${encodeURIComponent(config.query)}`,
        {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then(response => {
        if (response.ok) {
          return resolve(response.json())
        } else {
          reject(response.statusText)
        }
      })
      .catch(error => {
        console.log(error.message)
        reject(error.message)
      })
  })
}
