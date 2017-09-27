import React from 'react'
import PropTypes from 'prop-types'
import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import StickyNote from './sticky-note'
import ReleaseStepSquare from './release-step-square/index.jsx'

import './index.scss'

class StoryMapView extends React.Component {
  render() {
    let { steps, releases, issues, isDirty } = this.props

    let rows = []
    releases.sort((a,b) => a.number > b.number).forEach((m) => {
      let row = (
        <tr className="release-row" key={m.id + Math.random()}>
          <th scope="row" className="release"><StickyNote issue={{title: m.title, user: ''}} type="release" notes={[]} /></th>
          {steps.slice().reverse().map(c => {
            let filteredIssues = issues.filter(i => i.milestone === m.title && i.labels.includes(c.name))
            return (
              <td key={m.id + c.id + Math.random()} className="story-group">
                <ReleaseStepSquare
                  release={m}
                  step={c}
                  notes={filteredIssues}
                  onMoveStickyNote={this.props.onMoveStickyNote}
                />
              </td>
            )
          })}
        </tr>
      )
      rows.push(row)
    })
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1 className="story-map-view-title">Story Map</h1>
            <button className="btn btn-primary" onClick={() => this.props.onBack()}>GO Back</button>
            <button className="btn btn-primary" onClick={() => this.props.onUndo()} disabled={!isDirty}>Undo</button>
            <button className="btn btn-primary" onClick={() => this.props.onClearSession()} disabled={isDirty}>clear Session</button>
            {
              isDirty &&
              <div className="alert alert-warning" role="alert">
                Story Map has been modified locally
              </div>
            }
            <hr />
            <div className="main-content story-map">
              <table>
                <thead>
                  <tr className="table-header-row">
                    <td></td>
                    {steps.slice().reverse().map((c, id) => (
                      <th key={id} scope="col" className="workflow-step">
                        <StickyNote issue={{title: c.name, user: ''}} type="step" />
                      </th>
                    )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

StoryMapView.propTypes = {
  steps: PropTypes.array.isRequired,
  releases: PropTypes.array.isRequired,
  issues: PropTypes.array.isRequired,
  onMoveStickyNote: PropTypes.func.isRequired,
  onClearSession: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
  onUndo: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
}

export default DragDropContext(HTML5Backend)(StoryMapView)
