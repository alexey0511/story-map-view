import React from 'react'
import ReactDOM from 'react-dom'

import 'index.scss'

class App extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      issues: [],
      milestones: [],
      categories: []
    }
  }
  fetchIssues() {
    let backend_url = 'https://api.github.com/repos/alexey0511/story-map-view'

    Promise.all([
      fetch(`${backend_url}/issues`),
      fetch(`${backend_url}/labels`),
      fetch(`${backend_url}/milestones`)
    ]).then(responses => {
      Promise.all(responses.map(response => response.json())).then(data => {
        this.setState({
          categories: data[1].filter(c => c.name.indexOf('Category') > -1).reverse(),
          milestones: data[2].reverse(),
          issues: data[0].map(i => {
            return {
              title: i.title,
              milestone: i.milestone.title,
              labels: i.labels.map(l=> l.name),
              user: i.user.login,
              id: i.id
            }
          }).reverse()
        })
      })
    })
  }

  componentDidMount() {
    this.fetchIssues()
  }

  render() {

    let headings = this.state.categories.map((c) => {
      return <div key={'h_' + c.id}>{c.name}</div>
    }).reverse()

    let data = [].concat(headings )

    this.state.milestones.sort((a,b) => a.number > b.number).forEach((m) => {
      data.push(<div key={'m_' + m.id}>{m.title}</div>)
      this.state.categories.reverse().forEach(c => {
        let issues = this.state.issues.filter(issue => {
          return issue.milestone === m.title && issue.labels.includes(c.name)
        })
        let issuesNodes = issues.map((issue) => {
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
            <div className="wrapper">
              <div className="cell" style={{border: '0px'}}></div>
              { data }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
