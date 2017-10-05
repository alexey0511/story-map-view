import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { DragSource } from 'react-dnd'
import './index.scss'

class StickyNote extends React.Component {
  render() {
    const { connectDragSource, isDragging, type, issue } = this.props

    const classes = classnames(
      'issue',
      type === 'step' ? 'step': null,
      type === 'release' ? 'release' : null
    )
    return connectDragSource(
      <div className={classes} style={{ opacity: isDragging ? 0 : 1}}>
        <div>{issue.title}</div>
        <small>{issue.user}</small>
      </div>
    )
  }
}

StickyNote.propTypes = {
  issue: PropTypes.object.isRequired,
  type: PropTypes.string,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired
}


const NoteSource = {
  beginDrag(props) {
    return {
      issue: props.issue
    }
  }
}

const collect = (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

export default DragSource('note', NoteSource, collect)(StickyNote)
