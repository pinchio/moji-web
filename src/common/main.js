var App = require('./App')
  , React = require('react/addons')
  , $ = require('jquery')
  , Router = require('./Router')
  , fastclick = require('fastclick')
  , db = require('./Db').get_instance()

$(function() {
    // React.initializeTouchEvents(true)
    var app = React.renderComponent(App.get_instance(), document.getElementById('app'))
      , router = new Router()

    fastclick(document.body)

    // For debugging only.
    app.React = React
    app.$ = $
    app.router = router
    app.db = db

    window.app = app
})
