import React from 'react'
import PropTypes from 'prop-types'

class StoryMapView extends React.Component {
  render() {
    const { categories, milestones, issues } = this.props

    let headings = categories.map((c) => {
      return <div key={'h_' + c.id}>{c.name}</div>
    }).reverse()

    let data = [].concat(headings)

    milestones.sort((a,b) => a.number > b.number).forEach((m) => {
      data.push(<div key={'m_' + m.id}>{m.title}</div>)
      categories.reverse().forEach(c => {
        let issuesfiltered = issues.filter(issue => {
          return issue.milestone === m.title && issue.labels.includes(c.name)
        })
        let issuesNodes = issuesfiltered.map((issue) => {
          return (
            <div key={issue.id + Math.random()} className="issue">
              <h4>{issue.title}</h4>
              <div>{issue.user}</div>
            </div>
          )
        })
        data.push(<div key={m.id + '_' + c.id + Math.random()} className="cell">{issuesNodes}</div>)
      })
    })


    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1>React app</h1>
            <div>Displaying issues from
              <a href="https://github.com/alexey0511/story-map-view/issues">
                https://github.com/alexey0511/story-map-view/issues
              </a></div>
            <button className="btn btn-primary" onClick={() => this.props.onBack()}>Back</button>
            <div className="wrapper" style={{gridTemplateColumns: `repeat(${categories.length + 1}, 1fr)`}}>
              <div className="cell" style={{border: '0px'}}></div>
              { data }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

StoryMapView.propTypes = {
  categories: PropTypes.array.isRequired,
  milestones: PropTypes.array.isRequired,
  issues: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired
}

export default StoryMapView
