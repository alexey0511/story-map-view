// TODO:
//  1. clean up
//  2. set state errors
//  3. loading state

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

const SERVER_URL = './api'


class App extends React.Component {
  constructor(props) {
    super(props)

    let params = new URLSearchParams(props.location.search)

    this.state = {
      displayStoryMap: false,
      issues: [],
      releases: [],
      steps: [],
      tags: params.has('tags') && params.get('tags') !== '' ? params.get('tags').split(',') : [],
      issueTracker: params.has('service') ? params.get('service') : issueTrackers[0],
      isAuthenticated: false,
      service: '',
      isDirty: false
    }
  }

  async isAuthenticated(service) {
    try {
      let response = await fetch(`${SERVER_URL}/is-authenticated/${service}`, { credentials: 'include' })
      let data = await response.json()
      this.setState({ isAuthenticated: data })
      return data
    } catch(e) { return false}
  }


  async checkView() {
    let params = new URLSearchParams(this.props.location.search)
    if (params.has('service')) {
      this.setState({ service: params.get('service') })
      try {
        if (params.has('project')) {
          // TRY to load view
          const project = params.get('project')
          if (sessionStorage &&
              (sessionStorage.getItem('project-' + project) || sessionStorage.getItem('project-' + project + '-modified'))) {
            if (sessionStorage.getItem('project-' + project + '-modified')) {
              const projectData = JSON.parse(sessionStorage.getItem('project-' + project + '-modified'))
              this.setState({isDirty: true})
              this.showStoryMap(projectData)
            } else if (sessionStorage.getItem('project-' + project)) {
              const projectData = JSON.parse(sessionStorage.getItem('project-' + project))
              this.showStoryMap(projectData)
            }
          } else {
            let isAuthenticated = await this.isAuthenticated(params.get('service'))
            if (!isAuthenticated) {
              // user can't see project because he is not authenticated
              isAuthenticated = await this.loginPrompt.show()
            }
            if (isAuthenticated) {
              this.setState({ selectedProject: params.get('project') })
              this.loadData(params.get('project'))
            }
          }
        }
      } catch (e) { /* */}
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
        // save data
        if (sessionStorage) {
          sessionStorage.setItem('project-' + project, JSON.stringify(data))
        }
        this.showStoryMap(data)
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
    this.setState({ displayStoryMap: false})
    let params = new URLSearchParams(this.props.location.search)
    if (params.get('project')) {
      params.delete('project')
    }
    this.props.history.push(`?${params.toString()}`)
  }

  moveStickyNote(release, label, issueToDrag) {
    const { releases, steps } = this.state

    if (issueToDrag.milestone && issueToDrag.labels) {
      // copy array
      let issues = [...this.state.issues]
      issues.forEach(i => {
        if (i.id === issueToDrag.id) {
          i.milestone = release.title
          i.labels = [label.name]
        }
      })

      this.showStoryMap({ releases, steps, issues })

      // save state to session sessionStorage
      let params = new URLSearchParams(this.props.location.search)
      if (sessionStorage && params.get('project')) {
        let data = { releases, steps, issues }
        sessionStorage.setItem('project-' + params.get('project') + '-modified', JSON.stringify(data))
        this.setState({isDirty: true})
      }
    }
  }

  showStoryMap({releases, steps, issues}) {
    const tags = this.state.tags
    if (tags.length) {
      steps = steps.filter(c => tags.includes(c.name))
    }

    this.setState({
      displayStoryMap: true,
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

  removeSavedChanges() {
    let params = new URLSearchParams(this.props.location.search)
    let project = params.get('project')
    if (sessionStorage && project) {
      // remove object from session storage
      sessionStorage.removeItem('project-' + project + '-modified')
      this.setState({isDirty: false})
      // reload issues
      this.checkView()
    }
  }

  downloadFromServer() {
    let params = new URLSearchParams(this.props.location.search)
    let project = params.get('project')
    if (sessionStorage && project) {
      // remove object from session storage
      sessionStorage.removeItem('project-' + project)
    }
    this.checkView()
  }

  render() {
    return (
      <div>
        <LoginPrompt
          ref={dialog => this.loginPrompt = dialog}
          service={this.state.service}
        />
        { this.state.displayStoryMap ?
          <StoryMapView
            steps={this.state.steps}
            releases={this.state.releases}
            issues={this.state.issues}
            onBack={this.goBack.bind(this)}
            isDirty={this.state.isDirty}
            onUndo={this.removeSavedChanges.bind(this)}
            onDownloadServer={this.downloadFromServer.bind(this)}
            onMoveStickyNote={this.moveStickyNote.bind(this)}
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
