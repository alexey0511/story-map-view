import React from 'react'
import PropTypes from 'prop-types'
import {Base64} from 'js-base64'

import './index.scss'

const issueTrackers = ['GitHub', 'GitLab','Redmine']

class Config extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      issueTracker: issueTrackers[0],
      username: '',
      password: '',
      project: '',
      redmineKey: '',
      projects: []
    }
  }

  onIssueTrackerChange(e) {
    this.setState({
      issueTracker: e.target.value
    })
  }

  onUsernameChange(e) {
    this.setState({ username: e.target.value })
  }

  onPasswordChange(e) {
    this.setState({ password: e.target.value })
  }
  onRedmineKeyChange(e) {
    this.setState({ redmineKey: e.target.value })
  }

  onProjectChange(e) {
    this.setState({ project: e.target.value })
  }

  async fetchGithub() {
    try {
      let endpoint = 'https://api.github.com'
      let backend_url = `${endpoint}/repos/${this.state.username}/${this.state.project}`
      let responses = await Promise.all([
        fetch(`${backend_url}/issues`),
        fetch(`${backend_url}/labels`),
        fetch(`${backend_url}/milestones`)
      ])

      let data = await Promise.all(responses.map(r => r.json()))

      return {
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
      }
    } catch(e) { this.handleErrors(e) }
  }

  async fetchGitlabExternal() {
    try {
      // get access token
      const gitlab_url = 'https://gitlab.catalyst.net.nz'

      let params = {
        grant_type: 'password',
        username: this.state.username,
        password: this.state.password
      }

      let formData = new FormData()

      for (var k in params) {
        formData.append(k, params[k])
      }

      let r1 = await fetch(`${gitlab_url}/oauth/token`, {
        method: 'POST',
        body: formData
      })
      const { access_token } = await r1.json()

      // get project id
      let r2 = await fetch(`${gitlab_url}/api/v4/projects?access_token=${access_token}`)
      const projects = await r2.json()

      const project = projects.find(p => p.name === this.state.project)

      let responses = await Promise.all([
        fetch(`${gitlab_url}/api/v4/projects/${project.id}/issues?access_token=${access_token}`),
        fetch(`${gitlab_url}/api/v4/projects/${project.id}/labels?access_token=${access_token}`),
        fetch(`${gitlab_url}/api/v4/projects/${project.id}/milestones?access_token=${access_token}`)
      ])

      let data = await Promise.all(responses.map(r => r.json()))

      return {
        categories: data[1].filter(c => c.name.indexOf('Category') > -1).reverse(),
        milestones: data[2].reverse(),
        issues: data[0].map(i => {
          return {
            title: i.title,
            milestone: i.milestone.title,
            labels: i.labels,
            user: i.author.name,
            id: i.id
          }
        }).reverse()
      }
    } catch(e) { this.handleErrors(e) }
  }

  async fetchRedmine() {
    try {
      const redmine_url = 'https://redmine.catalyst.net.nz'

      let project = { id: 396}
      let response = await fetch(`${redmine_url}/issues.json?key=${this.state.redmineKey}&project_id=${project.id}&include=relations`)
      let json = await response.json()


      let categories = json.issues.map(i => ({name: i.category.name, id: i.category.id}))

      let uniqueCategories = categories.reduce((hash, obj) => {
        let isExist = Object.values(hash).some(v => v.id === obj.id)
        return !isExist ? Object.assign(hash, {[obj.id] : obj}) : hash
      }, Object.create(null))

      let milestones = json.issues.map((i, id) => ({title: i.release.release.name, id: i.release.release.id, number: -1 * id}))

      let uniqueMilestones = Object.values(milestones.reduce((hash, obj) => {
        let isExist = Object.values(hash).some(v => v.id === obj.id)
        return !isExist ? Object.assign(hash, {[obj.id] : obj}) : hash
      }, Object.create(null)))

      return {
        categories: Object.values(uniqueCategories).reverse(),
        milestones: uniqueMilestones,
        issues: json.issues.map(i => ({
          title: i.subject,
          milestone: i.release.release.name,
          labels: [i.category.name],
          user: i.author.name,
          id: i.id
        }))
      }
    } catch(e) { this.handleErrors(e) }
  }

  handleErrors(e) {
    alert('Could not fetch data. check user and project. Also see console.log for details')
    console.error(e)
    return false
  }

  async handleViewStoryMap(e) {
    e.preventDefault()

    // let milestones, categories, issues
    let data
    switch(this.state.issueTracker) {
      case 'GitHub':
        if (this.state.username && this.state.project) {
          data = await this.fetchGithub()
        } else {
          alert('username or project name is missing')
        }
        break
      case 'GitLab':
        data = await this.fetchGitlabExternal()
        break
      case 'Redmine':
        data = await this.fetchRedmine()

        break
      default:
        console.log(this.state.issueTracker)
    }

    if (data) {
      this.props.onPrepareView(data)
    }
  }

  render() {
    const { username, password, redmineKey, issueTracker } = this.state
    return (
      <div className='container'>
        <h1>Config</h1>
        <div className='row'>
          <div className='col-md-12'>

            <form className='form1' action=''>
              <label htmlFor='tracker-type'>Select Tool</label>
              <select id='tracker-type' value={issueTracker} onChange={this.onIssueTrackerChange.bind(this)}>
                {issueTrackers.map((option, i) => <option key={i} value={option}>{option}</option>)}
              </select>

              <label htmlFor='username'>Username</label>
              <input id='username' type='text' value={username} onChange={this.onUsernameChange.bind(this)} />

              <label htmlFor='password'>Password</label>
              <input id='password' type='password' value={password} onChange={this.onPasswordChange.bind(this)} />

              <label htmlFor='redmineKey'>Redmine Key</label>
              <input id='redmineKey' type='redmineKey' value={redmineKey} onChange={this.onRedmineKeyChange.bind(this)} />

              <label htmlFor='project-name'>Project Name</label>
              <input
                id='project-name'
                type='text'
                value={this.state.project}
                onChange={this.onProjectChange.bind(this)}
                placeholder='story-map-view'
              />

              <button
                onClick={this.handleViewStoryMap.bind(this)}
                className='btn btn-primary'
              >View Story Map</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

Config.propTypes = {
  onPrepareView: PropTypes.func.isRequired,
  projects: PropTypes.array.isRequired
}

export default Config
