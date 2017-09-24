import React from 'react'
import PropTypes from 'prop-types'

// const SERVER_URL = 'http://localhost:3000'
const SERVER_URL = 'https://story-map-view-server.herokuapp.com'


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

    if (response.status === 200) {
      this.props.onAuthenticated(true)
    } else {
      this.props.onAuthenticated(false)

    }
  }

  render() {
    const { username, password } = this.state
    return (
      <div style={{display: 'grid'}}>
        <label htmlFor='username'>Username</label>
        <input id='username' type='text' value={username} onChange={this.onUsernameChange.bind(this)} />

        <label htmlFor='password'>Password</label>
        <input id='password' type='password' value={password} onChange={this.onPasswordChange.bind(this)} />

        <button className="btn btn-primary" onClick={function(e) {
          e.preventDefault()
          this.login(this.state.username, this.state.password)
        }.bind(this)}>Login</button>

      </div>
    )
  }
}

Login.propTypes = {
  service: PropTypes.string.isRequired,
  onAuthenticated: PropTypes.func.isRequired
}

export default Login
