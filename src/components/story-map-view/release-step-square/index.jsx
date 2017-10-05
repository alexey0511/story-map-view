import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DropTarget } from 'react-dnd'
import StickyNote from '../sticky-note'

import './index.scss'


class ReleaseStepSquare extends Component {
  render() {
    const { connectDropTarget, notes } = this.props

    return connectDropTarget(
      <div className="release-step-square">
        {notes.map((note, id) => <StickyNote key={id} issue={note} type={note.type} />)}
        {this.props.isOver &&
          <div className="hover-layer"></div>
        }
      </div>
    )
  }
}

ReleaseStepSquare.propTypes = {
  release: PropTypes.object.isRequired,
  step: PropTypes.object.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  notes: PropTypes.array,
  isOver: PropTypes.bool.isRequired,
  children: PropTypes.node
}

const squareTarget = {
  drop(props, monitor) {
    const { release, step } = props
    const { issue } = monitor.getItem()

    props.onMoveStickyNote(release, step, issue)
  }
}

const collect = (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}

export default DropTarget('note', squareTarget, collect)(ReleaseStepSquare)
