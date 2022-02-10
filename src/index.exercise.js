import React from 'react'
import ReactDOM from 'react-dom'
import {Logo} from './components/logo'
import Dialog from '@reach/dialog'
import '@reach/dialog/styles.css'

const Form = ({onSubmit, buttonText}) => {
  const nameRef = React.useRef('')
  const passwordRef = React.useRef('')

  const handleSubmit = event => {
    event.preventDefault()
    onSubmit({
      name: nameRef.current.value,
      password: passwordRef.current.value,
    })
  }

  return (
    <form>
      <div>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          ref={nameRef}
          placeholder="user name"
        />
      </div>
      <div>
        <label htmlFor="username">Password</label>
        <input
          type="password"
          ref={passwordRef}
          id="password"
          name="password"
          placeholder="password"
        />
      </div>
      <button type="button" onClick={handleSubmit}>
        {buttonText}
      </button>
    </form>
  )
}
const App = ({title}) => {
  const [text, setText] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = text => () => {
    setText(text)
    setIsOpen(true)
  }

  const onSubmit = values => {
    console.log('login', values)
  }

  return (
    <div>
      <Logo width={80} height={80} />
      <h1>{title}</h1>
      <Dialog isOpen={isOpen} aria-label="Login Register form">
        <button onClick={() => setIsOpen(false)}>Close</button>
        <Form onSubmit={onSubmit} buttonText={text} />
      </Dialog>
      <button onClick={handleClick('login')}>Login</button>
      <button onClick={handleClick('register')}>Register</button>
    </div>
  )
}
const root = document.getElementById('root')

ReactDOM.render(<App title="Bookshelf" />, root)
