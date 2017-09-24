import { createStore, applyMiddleware, compose } from 'redux'
// import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

import reducers from './reducers'

export default function configureStore() {
  const middleware = [ thunk ]

  // if (process.env.NODE_ENV !== 'production') {
  //   middleware.push(createLogger({ diff: true, collapsed: true }))
  // }
  const composeEnhancers =
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      }) : compose

  const enhancer = composeEnhancers(
    applyMiddleware(...middleware)
    // other store enhancers if any
  )
  return createStore(reducers, enhancer)
}
