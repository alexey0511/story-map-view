import React from 'react'
import PropTypes from 'prop-types'
import {Base64} from 'js-base64'
import { WithContext as ReactTags } from 'react-tag-input'
import Loading from 'components/loading'

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
      projects: [],
      tags: [],
      isLoading: false
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

  onProjectChange(e) {
    this.setState({ project: e.target.value })
  }

  async fetchGithub() {
    try {
      let endpoint = 'https://story-map-view-server.herokuapp.com/github'
      let headers = new Headers({
        'Authorization': 'Basic ' + Base64.encode(this.state.username + ':' + this.state.password)
      })

      let backend_url = `${endpoint}/repos/${this.state.username}/${this.state.project}`
      let responses = await Promise.all([
        fetch(`${backend_url}/issues`, { headers }),
        fetch(`${backend_url}/labels`, { headers }),
        fetch(`${backend_url}/milestones`, { headers })
      ])

      let data = await Promise.all(responses.map(r => r.json()))

      let categories
      if (this.state.tags.length) {
        let tags = this.state.tags.map(t => t.text)
        categories = data[1].filter(c => tags.includes(c.name)).reverse()
      } else {
        categories = data[1].reverse()
      }
      return {
        categories,
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
      let gitlab_url = 'https://story-map-view-server.herokuapp.com/gitlab'

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
      let categories
      if (this.state.tags.length) {
        let tags = this.state.tags.map(t => t.text)
        categories = data[1].filter(c => tags.includes(c.name)).reverse()
      } else {
        categories = data[1].reverse()
      }

      if (!categories.length || !data[2].length) {
        alert("Selected Project doesn't have any categories or milestones")
        return false
      }

      return {
        categories,
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
      let redmine_url = 'https://story-map-view-server.herokuapp.com/redmine'

      let headers = new Headers({
        'Authorization': 'Basic ' + Base64.encode(this.state.username + ':' + this.state.password)
      })

      let r1 = await fetch(`${redmine_url}/projects.json`, { headers })
      let json1 = await r1.json()
      let project = json1.projects.find(p => p.name === this.state.project)

      if (!project) { return false }

      let r2 = await fetch(`${redmine_url}/issues.json?project_id=${project.id}&include=relations`, { headers })
      let json2 = await r2.json()
      let issues = json2.issues


      let categories = issues.filter(i => !!i.category).map(i => ({name: i.category.name, id: i.category.id}))

      let uniqueCategories = categories.reduce((hash, obj) => {
        let isExist = Object.values(hash).some(v => v.id === obj.id)
        return !isExist ? Object.assign(hash, {[obj.id] : obj}) : hash
      }, Object.create(null))

      let milestones = issues
        .filter(m => !!m.release && !!m.release.release)
        .map((i, id) => ({title: i.release.release.name, id: i.release.release.id, number: -1 * id}))

      let uniqueMilestones = Object.values(milestones.reduce((hash, obj) => {
        let isExist = Object.values(hash).some(v => v.id === obj.id)
        return !isExist ? Object.assign(hash, {[obj.id] : obj}) : hash
      }, Object.create(null)))

      let filteredCategories
      if (this.state.tags.length) {
        let tags = this.state.tags.map(t => t.text)
        filteredCategories = Object.values(uniqueCategories).filter(c => tags.includes(c.name)).reverse()
      } else {
        filteredCategories = Object.values(uniqueCategories).reverse()
      }

      if (!categories.length || !milestones.length) {
        alert("Selected Project doesn't have any categories or milestones")
        return false
      }

      return {
        categories: filteredCategories,
        milestones: uniqueMilestones,
        issues: json2.issues.map(i => ({
          title: i.subject,
          milestone: !!i.release && !!i.release.release ? i.release.release.name : null,
          labels: [i.category ? i.category.name:null],
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
          this.setState({ isLoading: true })
          data = await this.fetchGithub()
          this.setState({ isLoading: false })
        } else {
          alert('username or project name is missing')
        }
        break
      case 'GitLab':
        this.setState({ isLoading: true })
        data = await this.fetchGitlabExternal()
        this.setState({ isLoading: false })
        break
      case 'Redmine':
        this.setState({ isLoading: true })
        data = await this.fetchRedmine()
        this.setState({ isLoading: false })
        break
      default:
        console.log('Issue tracker does not exist', this.state.issueTracker)
    }

    if (data) {
      this.props.onPrepareView(data)
    }
  }

  async loadGitlabProjects() {
    let gitlab_url = 'https://story-map-view-server.herokuapp.com/gitlab'

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
    return await r2.json()
  }

  async loadRedmineProjects() {
    let redmine_url = 'https://story-map-view-server.herokuapp.com/redmine'

    let headers = new Headers({
      'Authorization': 'Basic ' + Base64.encode(this.state.username + ':' + this.state.password)
    })
    let response = await fetch(`${redmine_url}/projects.json`, { headers })


    let json = await response.json()
    return json.projects
  }

  async handleLoadProjects(e) {
    e.preventDefault()
    let data, response

    if (!this.state.username || !this.state.password) {
      alert('Provide username or login')
    } else {
      let headers = new Headers({
        'Authorization': 'Basic ' + Base64.encode(this.state.username + ':' + this.state.password)
      })

      switch(this.state.issueTracker) {
        case 'GitHub':
          this.setState({ isLoading: true })
          var endpoint = 'https://story-map-view-server.herokuapp.com/github'
          response = await fetch(`${endpoint}/user/repos`, { headers }),
          data = await response.json()
          this.setState({ isLoading: true })

          break
        case 'GitLab':
          this.setState({ isLoading: true })
          data = await this.loadGitlabProjects()
          this.setState({ isLoading: false })
          break
        case 'Redmine':
          this.setState({ isLoading: true })
          data = await this.loadRedmineProjects()
          this.setState({ isLoading: false })
          break
        default:
          console.log('Issue tracker does not exist', this.state.issueTracker)
      }

      if (data) {
        this.setState({ projects: data })
      }
    }
  }

  // tags
  handleDelete(i) {
    let tags = this.state.tags
    tags.splice(i, 1)
    this.setState({tags: tags})
  }

  handleAddition(tag) {
    let tags = this.state.tags
    tags.push({ id: tags.length + 1, text: tag })
    this.setState({tags: tags})
  }

  handleDrag(tag, currPos, newPos) {
    let tags = this.state.tags

    // mutate array
    tags.splice(currPos, 1)
    tags.splice(newPos, 0, tag)

    // re-render
    this.setState({ tags: tags })
  }

  render() {
    const { username, password, issueTracker } = this.state
    return (
      <div className='container'>
        <h1>Config</h1>
        <div className='row'>
          <div className='col-md-12'>
            { this.state.isLoading ? <Loading /> :
              <form className='form1' action=''>
                <label htmlFor='tracker-type'>Select Tool</label>
                <select id='tracker-type' value={issueTracker} onChange={this.onIssueTrackerChange.bind(this)} className="form-control">
                  {issueTrackers.map((option, i) => <option key={i} value={option}>{option}</option>)}
                </select>

                <label htmlFor='username'>Username</label>
                <input id='username' type='text' value={username} onChange={this.onUsernameChange.bind(this)} />

                <label htmlFor='password'>Password</label>
                <input id='password' type='password' value={password} onChange={this.onPasswordChange.bind(this)} />

                <label htmlFor='project-name'>Enter the project or select from the list</label>
                { this.state.projects.length ?
                  <select id='projects' onChange={this.onProjectChange.bind(this)}  className="form-control">
                    <option value=""></option>
                    {this.state.projects.map((option, i) => <option key={i} value={option.name}>{option.name}</option>)}
                  </select>
                  :
                  <button
                    onClick={this.handleLoadProjects.bind(this)}
                    className='btn btn-primary'
                  >Load Projects</button>
                }

                <input
                  id='project-name'
                  type='text'
                  value={this.state.project}
                  onChange={this.onProjectChange.bind(this)}
                  placeholder='story-map-view'
                />


                <label htmlFor='tags'>Story Map Tags</label>
                <ReactTags
                  tags={this.state.tags}
                  id="tags"
                  handleDelete={this.handleDelete.bind(this)}
                  handleAddition={this.handleAddition.bind(this)}
                  handleDrag={this.handleDrag.bind(this)} />

                <button
                  onClick={this.handleViewStoryMap.bind(this)}
                  className='btn btn-primary'
                >View Story Map</button>
              </form>
            }
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
