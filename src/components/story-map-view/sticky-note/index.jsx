import React from 'react'
import PropTypes from 'prop-types'

import './index.scss'

class StickyNote extends React.Component {
  render() {
    return (
      <div className="issue">
        <div>{this.props.issue.title}</div>
        <small>{this.props.issue.user}</small>
      </div>
    )
  }
}

StickyNote.propTypes = {
  issue: PropTypes.object.isRequired,
}

export default StickyNote
