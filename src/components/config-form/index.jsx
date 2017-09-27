import React from 'react'
import PropTypes from 'prop-types'
import { WithContext as ReactTags } from 'react-tag-input'
import Loading from 'components/loading'
import { withRouter } from 'react-router-dom'
import Login from 'components/login'

import './index.scss'

// const SERVER_URL = 'http://localhost:3000'
const SERVER_URL = 'https://story-map-view-server.herokuapp.com'


class ConfigForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedProject: '',
      projects: [],
      tags: [],
      isLoading: false,
      loadingProjects: false,
      loadingData: false,
      isAuthenticated: false
    }
  }

  componentDidMount() {
    let params = new URLSearchParams(this.props.location.search)
    if (params.has('tags')) {
      this.setState({ tags: params.get('tags').split(',').map(t => ({id: t, text: t}) )})
    }
  }
  componentWillReceiveProps(props) {
    if (props.service && props.service !== this.props.service) {
      this.setState({
        projects: [],
        selectedProject: '',
        tags: []
      })
    }
  }


  onProjectChange(e) {
    this.setState({ selectedProject: e.target.value })
  }

  // // tags
  handleDelete(index) {
    let tags = this.state.tags.map(t => t.id)
    tags.splice(index, 1)

    this.setState({tags: tags.map(t => ({id:t, text:t}) )})
    let params = new URLSearchParams(this.props.location.search)
    params.set('tags', tags.join(','))
    this.props.history.push('?' + params.toString())

  }

  handleAddition(tag) {
    let params = new URLSearchParams(this.props.location.search)
    let tags = params.get('tags')
    let tagsArray = tags ? tags.split(',') : []

    if (!tagsArray.includes(tag)) {
      tagsArray.push(tag)
    }

    this.setState({ tags: tagsArray.map(t => ({id:t, text:t }))})
    params.set('tags', tagsArray.join(','))
    this.props.history.push('?'+ params.toString())
  }

  async handleLoadProjects(e) {
    e.preventDefault()
    this.setState({
      loadingProjects: true
    })
    try {
      let response = await fetch(`${SERVER_URL}/projects/${this.props.service}`, { credentials: 'include'})

      if (!response.ok) { throw response }

      let projects = await response.json()
      this.setState({ projects })
    } catch (err) {
      console.log(err)
      this.props.onError(err) }
    this.setState({ loadingProjects: false })

  }
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            { this.state.isLoading ? <Loading /> :
              <form className='form1' action=''>
                {!this.props.isAuthenticated ?
                  <Login
                    service={this.props.service}
                    onAuthenticated={this.props.onAuthenticated}
                  />
                  :
                  <div>
                    <label htmlFor='project-name'>Enter the project ID or select from the list</label>
                    { this.state.projects.length ?
                      <select id='projects' onChange={this.onProjectChange.bind(this)}  className="form-control">
                        <option value=""></option>
                        {this.state.projects.map((option, i) => <option key={i} value={option.id}>{option.name}</option>)}
                      </select>
                      :
                      <button
                        onClick={this.handleLoadProjects.bind(this)}
                        className='btn btn-primary'
                        disabled={this.state.loadingProjects}
                      >Load Projects</button>
                    }
                  </div>
                }
                <div>
                  <input
                    id='project-name'
                    type='text'
                    value={this.state.selectedProject}
                    onChange={this.onProjectChange.bind(this)}
                    placeholder='story-map-view'
                  />

                  <label htmlFor='tags'>Story Map Tags</label>
                  <ReactTags
                    tags={this.state.tags}
                    id="tags"
                    handleDelete={this.handleDelete.bind(this)}
                    handleAddition={this.handleAddition.bind(this)}
                  />

                  <button
                    onClick={e => {
                      e.preventDefault()
                      this.props.onLoadData(this.state.selectedProject)
                    }}
                    className='btn btn-primary'
                    disabled={this.state.loadingData}
                  >View Story Map</button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    )
  }
}

ConfigForm.propTypes = {
  service: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  onShowStoryMap: PropTypes.func.isRequired,
  onLoadData: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onAuthenticated: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired
}

export default withRouter(ConfigForm)
