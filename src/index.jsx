// TODO:
//  1. clean up
//  2. set state errors
//  3. loading state
//  4. remember labels on view

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import PropTypes from 'prop-types'

import 'index.scss'

import StoryMapView from 'components/story-map-view'
import Config from 'components/config'
import Loading from 'components/loading'
import LoginPrompt from 'components/modal'

const issueTrackers = ['github', 'gitlab-external','redmine']

// const SERVER_URL = 'http://localhost:3000'
const SERVER_URL = 'https://story-map-view-server.herokuapp.com'

class App extends React.Component {
  constructor(props) {
    super(props)

    let params = new URLSearchParams(props.location.search)

    this.state = {
      allReady: false,
      issues: [],
      releases: [],
      steps: [],
      tags: [],
      issueTracker: params.has('service') ? params.get('service') : issueTrackers[0],
      isAuthenticated: false,
      service: ''
    }
  }

  async isAuthenticated(service) {
    let response = await fetch(`${SERVER_URL}/is-authenticated/${service}`, { credentials: 'include' })
    let isAuthenticated = await response.json()
    this.setState({ isAuthenticated })
    return isAuthenticated
  }


  async checkView() {
    let params = new URLSearchParams(this.props.location.search)
    if (params.has('service')) {
      this.setState({ isLoading: true, service: params.get('service') })
      try {
        let isAuthenticated = await this.isAuthenticated(params.get('service'))
        if (params.has('project')) {
          if (!isAuthenticated) {
            // user can't see project because he is not authenticated
            isAuthenticated = await this.loginPrompt.show()
          }

          if (isAuthenticated) {
            this.setState({ selectedProject: params.get('project') })
            this.loadData(params.get('project'))
          }
        }
        if (isAuthenticated) {
          this.setState({ isAuthenticated })
        }
        this.setState({ isLoading: false})
      } catch (e) { this.setState({ isLoading: false})}
    } else {
      this.props.history.push('?service=' + this.state.issueTracker)
    }
  }

  async loadData(project) {
    this.setState({ loadingData: true})
    try {
      let response = await fetch(`${SERVER_URL}/fetch-view-data/${this.state.service}?project=${project}`, { credentials: 'include' })
      const data = await response.json()

      if (response.ok) {
        let params = new URLSearchParams(this.props.location.search)
        params.set('project', project)
        this.props.history.push(`?${params.toString()}`)

        this.setState({ loadingData: false})

        this.showStoryMap(data, this.state.tags)
      } else {
        this.setState({ loadingData: false})
      }

    } catch(e) {
      this.setState({ loadingData: false})
    }
  }
  componentDidMount() {
    this.checkView()
  }


  goBack() {
    this.setState({ allReady: false})
    console.log('this', this.props)
    let params = new URLSearchParams(this.props.location.search)
    if (params.get('project')) {
      params.delete('project')
    }
    this.props.history.push(`?${params.toString()}`)
  }

  showStoryMap({releases, steps, issues}, tags) {
    if (tags.length) {
      steps = steps.filter(c => tags.map(tag => tag.text).includes(c.name))
    }

    this.setState({
      allReady: true,
      releases,
      steps,
      issues
    })
  }

  changeService(service) {
    this.setState({service})
    this.isAuthenticated(service)
  }

  handleErrors(e) {
    if (e.status === 401) {
      this.setState({ isAuthenticated: false})
    }
    return false
  }

  render() {
    return (
      <div>
        <LoginPrompt
          ref={dialog => this.loginPrompt = dialog}
          service={this.state.service}
        />

        {
          this.state.allReady ?
            <StoryMapView
              steps={this.state.steps}
              releases={this.state.releases}
              issues={this.state.issues}
              onBack={this.goBack.bind(this)}
            />
            :
            this.state.loadingData ? <Loading /> :
              <Config
                onShowStoryMap={this.showStoryMap.bind(this)}
                onLoadData={this.loadData.bind(this)}
                onAuthenticated={function (isAuthenticated) { this.setState({ isAuthenticated})}.bind(this)}
                onServiceChange={this.changeService.bind(this)}
                onError={this.handleErrors.bind(this)}
                service={this.state.service}
                isAuthenticated={this.state.isAuthenticated}
              />
        }
        <div>Test data</div>
        <div>Gitlab project: test-project</div>
        <div>Github project: story-map-view</div>
        <div>Redmine project: Catalon Story Mapping</div>
      </div>
    )
  }
}

App.propTypes = {
  location: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
}

const Root = () => (<Router>
  <div>
    <Route component={App} />
  </div>
</Router>
)

ReactDOM.render(<Root />, document.getElementById('app'))
