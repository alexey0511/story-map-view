import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Login from 'components/login'


class LoginPrompt extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: false
    }
    this.promise = {}
  }
  show() {
    return new Promise((resolve, reject) => {
      this.promise = { resolve, reject }
      this.setState({ show: true })
    })
  }

  hide() {
    this.setState({
      show: false,
    })
  }

  confirm(isAuthenticated) {
    if (isAuthenticated) {
      this.promise.resolve(true)
      this.hide()
    } else {
      alert('bad credentials')
    }
  }

  cancel() {
    this.promise.resolve(false)
    this.hide()
  }

  render() {
    return (
      <Modal isOpen={this.state.show} ref={this.props.dialogRef}>
        <ModalHeader>Login to {this.props.service}</ModalHeader>
        <ModalBody>
          <Login
            service={this.props.service}
            isAuthenticated={false}
            onAuthenticated={this.confirm.bind(this)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.cancel.bind(this)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    )
  }
}

LoginPrompt.propTypes = {
  service: PropTypes.string.isRequired,
  dialogRef: PropTypes.any
}

export default LoginPrompt
