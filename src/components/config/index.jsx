import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import IssueTrackerSelector from 'components/issue-tracker-selector'

import ConfigForm from 'components/config-form'
const issueTrackers = ['github', 'gitlab-external','redmine']

import './index.scss'

class Config extends React.Component {
  constructor(props) {
    super(props)


    let params = new URLSearchParams(props.location.search)

    this.state = {
      service: params.has('service') ? params.get('service') : issueTrackers[0],
      projects: []
    }
  }

  changeService(service) {
    // update state
    this.props.onServiceChange(service)

    // update url params
    let params = new URLSearchParams(this.props.location.search)
    params.set('service', service)
    if (params.has('project')) {
      params.delete('project')
    }
    if (params.has('tags')) {
      params.delete('tags')
      this.props.history.push('?' + params.toString())
    }

    this.props.history.push(`?${params.toString()}`)

  }

  render() {
    return (
      <div>
        <div className='container service-select'>
          <div className='row'>
            <div className='col-md-12'>
              <IssueTrackerSelector
                name="github"
                title="Github"
                onSelectService={this.changeService.bind(this)}
              />
              <IssueTrackerSelector
                name="gitlab-external"
                title="Gitlab (external)"
                onSelectService={this.changeService.bind(this)}
              />
              <IssueTrackerSelector
                name="redmine"
                title="Redmine"
                onSelectService={this.changeService.bind(this)}
              />

            </div>
          </div>
        </div>
        <hr />

        <ConfigForm
          service={this.props.service}
          onShowStoryMap={this.props.onShowStoryMap}
          onLoadData={this.props.onLoadData}
          onError={this.props.onError}
          onAuthenticated={this.props.onAuthenticated}
          isAuthenticated={this.props.isAuthenticated}
        />
      </div>
    )
  }
}

Config.propTypes = {
  onShowStoryMap: PropTypes.func.isRequired,
  onLoadData: PropTypes.func.isRequired,
  onAuthenticated: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onServiceChange: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  service: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
}

export default withRouter(Config)
