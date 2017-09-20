import React from 'react'
import ReactDOM from 'react-dom'

import 'index.scss'

import StoryMapView from 'components/story-map-view'
import Config from 'components/config'

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      issueTracker: [],
      user: null,
      password: null,
      allReady: false,
      projects: [],
      issues: [],
      milestones: [],
      categories: []
    }
  }

  goBack() {
    this.setState({ allReady: false})
  }

  render() {
    return (
      <div>
        {
          this.state.allReady ?
            <StoryMapView
              categories={this.state.categories}
              milestones={this.state.milestones}
              issues={this.state.issues}
              onBack={this.goBack.bind(this)}
            />
            :
            <Config
              onPrepareView={({milestones, categories, issues }) => this.setState({
                allReady: true,
                milestones, categories, issues
              }) }
              projects={this.state.projects}
            />
        }
        <div>Test data</div>
        <div>Gitlab project: test-project</div>
        <div>Github project: story-map-view</div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
