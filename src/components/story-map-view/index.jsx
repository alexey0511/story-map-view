import React from 'react'
import PropTypes from 'prop-types'
import StickyNote from './sticky-note'


import './index.scss'
class StoryMapView extends React.Component {
  render() {
    let { steps, releases, issues } = this.props

    let rows = []
    releases.sort((a,b) => a.number > b.number).forEach((m) => {
      let row = (
        <tr className="release-row" key={m.id + Math.random()}>
          <th scope="row" className="release">{m.title}</th>
          {steps.reverse().map(c => {
            return (
              <td key={m.id + c.id + Math.random()} className="story-group">
                {
                  issues.filter(issue => {
                    return issue.milestone === m.title && issue.labels.includes(c.name)
                  }).map((issue) => <StickyNote key={issue.id + Math.random()} issue={issue} />)

                }
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
            <h1>Story Map</h1>
            <button className="btn btn-primary" onClick={() => this.props.onBack()}>GO Back</button>

            <div className="main-content story-map">
              <table>
                <thead>
                  <tr className="table-header-row">
                    <td></td>
                    {steps.map((c, id) => (
                      <th key={id} scope="col" className="workflow-step">{c.name}</th>
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
  onBack: PropTypes.func.isRequired
}

export default StoryMapView
