import React from 'react'
import PropTypes from 'prop-types'

const SERVER_URL = './api'

import './index.scss'

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: '',
    }
  }

  onUsernameChange(e) {
    this.setState({ username: e.target.value })
  }

  onPasswordChange(e) {
    this.setState({ password: e.target.value })
  }

  async login(username, password) {
    let response = await fetch(`${SERVER_URL}/login/${this.props.service}`, {
      credentials: 'include',
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json'}),
      body: JSON.stringify({username, password})})

    let isAuthenticated = await response.json()
    this.props.onAuthenticated(isAuthenticated)
  }

  async logout() {
    let response = await fetch(`api/logout/${this.props.service}`, {
      credentials: 'include'
    })
    let data = await response.json()

    this.props.onAuthenticated(!data)
  }

  render() {
    const { username, password } = this.state
    const { isAuthenticated } = this.props

    const el = !isAuthenticated ?
      <div className="login-form">
        <label htmlFor='username'>Username</label>
        <input id='username' type='text' value={username} onChange={this.onUsernameChange.bind(this)} />

        <label htmlFor='password'>Password</label>
        <input id='password' type='password' value={password} onChange={this.onPasswordChange.bind(this)} />

        <button className="btn btn-primary" onClick={function(e) {
          e.preventDefault()
          this.login(this.state.username, this.state.password)
        }.bind(this)}>Login</button>

      </div>
      :
      <div>
        <label>Authenticated</label>
        <button className="btn btn-primary" onClick={function(e) {
          e.preventDefault()
          this.logout()
        }.bind(this)}>Logout</button>
      </div>

    return el
  }
}

Login.propTypes = {
  service: PropTypes.string.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onAuthenticated: PropTypes.func.isRequired
}

export default Login
