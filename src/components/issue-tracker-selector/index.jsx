import React from 'react'
import PropTypes from 'prop-types'

import './index.scss'

class IssueTrackerSelector extends React.Component {
  constructor(props) {
    super(props)

    let params = new URLSearchParams(window.location.search)
    this.state = {
      active: params.get('service') === props.name
    }
  }
  componentWillReceiveProps(props) {
    let params = new URLSearchParams(window.location.search)
    this.setState({active: params.get('service') === props.name })
  }
  render() {
    return (
      <div className={'issue-tracker ' + (this.state.active ? 'active':'')}
        onClick={() => this.props.onSelectService(this.props.name)}
      >
        <img src={'src/assets/' + this.props.name + '-icon.png'} width="48px" height="48px" />
        <h4>{this.props.title}</h4>
      </div>
    )
  }
}

IssueTrackerSelector.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onSelectService: PropTypes.func.isRequired
}

export default IssueTrackerSelector
