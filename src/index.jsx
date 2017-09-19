import React from 'react'
import ReactDOM from 'react-dom'

import 'index.scss'

class App extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h1>React app</h1>
            <button className="btn btn-primary">button</button>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
