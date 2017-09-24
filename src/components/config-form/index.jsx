import React from 'react'
import PropTypes from 'prop-types'
import { WithContext as ReactTags } from 'react-tag-input'
import Loading from 'components/loading'
import { withRouter } from 'react-router-dom'
import Login from 'components/login'
import LoginPrompt from 'components/modal'

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


  componentWillReceiveProps(props, oldProps) {
    if (props.service && props.service !== oldProps.service) {
      this.setState({ projects: [], selectedProject: '' })
    }
  }


  onProjectChange(e) {
    this.setState({ selectedProject: e.target.value })
  }

  // // tags
  handleDelete(i) {
    let tags = this.state.tags
    tags.splice(i, 1)
    this.setState({tags: tags})
  }

  handleAddition(tag) {
    let tags = this.state.tag
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
            <LoginPrompt
              ref={dialog => this.loginPrompt = dialog}
              service={this.props.service}
            />
            { this.state.isLoading ? <Loading /> :
              <form className='form1' action=''>
                {!this.props.isAuthenticated ?
                  <Login
                    service={this.props.service}
                    onAuthenticated={this.props.onAuthenticated}
                  />
                  :
                  <div>
                    <label htmlFor='project-name'>Enter the project or select from the list</label>
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
                    handleDrag={this.handleDrag.bind(this)} />

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
