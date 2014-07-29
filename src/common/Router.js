var $ = require('jquery')
  , HomePage = require('../home/HomePage')
  , app = require('./App').get_instance()
  , routes = require('./routes')
  , page = require('page')
  , db = require('./Db').get_instance()

// TODO: rename data_enter to animation_enter, etc.
var Router = function Router() {
    this.__attach_link_on_click()

    for (var i = 0, ii = routes.length; i < ii; ++i) {
        var route = routes[i]
        page(route.route, this[route.handler].bind(this))
    }

    page(this.not_found)

    page.start({click: false, popstate: true, dispatch: true})
}

Router.prototype.reverse_animation_map = {
    'slide-in-from-right': 'slide-out-to-right'
  , 'slide-out-to-right': 'slide-in-from-right'
  , 'slide-in-from-left': 'slide-out-to-left'
  , 'slide-out-to-left': 'slide-in-from-left'
}

Router.prototype.reverse_animation = function(animation) {
    if (this.reverse_animation_map[animation]) {
        return this.reverse_animation_map[animation]
    } else {
        throw new Error('reverse_animation not allowed.')
    }
}

Router.prototype.home = function(ctx) {
    this.current_ctx = ctx

    var state = JSON.parse(JSON.stringify(ctx.state))
    var page = new HomePage(state)
    app.go(page)
}

Router.prototype.not_found = function(ctx) {
    // TODO:
    app.go(HomePage, {})
}

Router.prototype.__attach_link_on_click = function() {
    var self = this
    $(document).on('click', 'a', function(event) {
        var $current_target = $(event.currentTarget)
          , pass_through = false // TODO:

        if (!pass_through && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            var path = $current_target.attr('href')
              , data_enter = $current_target.attr('data-enter')
              , data_leave = $current_target.attr('data-leave')
              , data_back = $current_target.attr('data-back')
              , target = $current_target.attr('target')
              , state = {data_enter: data_enter, data_leave: data_leave, click: true}

            if (target === '_blank') {
                // Do nothing. Future tracking.
            } else {
                event.preventDefault()

                if (data_back) {
                    window.hipost.back()
                } else {
                    self.current_ctx.state.data_enter = self.reverse_animation(data_leave)
                    self.current_ctx.state.data_leave = self.reverse_animation(data_enter)
                    self.current_ctx.save()

                    page.show(path, state)
                }
            }
        }
    })
}

module.exports = Router
