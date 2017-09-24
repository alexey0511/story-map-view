import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

const initialState = {
  isLoading: false,
  isAuthenticated: false,
  auth: {
    'github': false,
    'gitlab-external': false,
    'redmine': false
  }
}

const mainReducer = (state = initialState, action) => {
  switch(action) {
    default:
      return state
  }
}

const rootReducer = combineReducers({
  mainReducer,
  form: formReducer
})

export default rootReducer
