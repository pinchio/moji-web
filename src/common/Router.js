var $ = require('jquery')
  , HomePage = require('../home/HomePage')
  , StoreArtistPage = require('../store/StoreArtistPage')
  , EmojiCollectionEditPage = require('../emoji_collection/EmojiCollectionEditPage')
  , app = require('./App').get_instance()
  , routes = require('./routes')
  , page = require('page')

// TODO: rename data_enter to animation_enter, etc.
var Router = function Router() {
    for (var i = 0, ii = routes.length; i < ii; ++i) {
        var route = routes[i]
        page(route.route, this[route.handler].bind(this))
    }

    page(this.not_found)

    page.start({click: false, popstate: true, dispatch: true})
}

Router.prototype.home = function(ctx) {
    this.current_ctx = ctx

    var page = new HomePage({ctx: ctx})
    app.go(page)
}

Router.prototype.artist = function(ctx) {
    this.current_ctx = ctx

    var page = new StoreArtistPage({ctx: ctx})
    app.go(page)
}

Router.prototype.emoji_collection_edit = function(ctx) {
    var page = new EmojiCollectionEditPage({ctx: ctx})
    app.go(page)
}

Router.prototype.not_found = function(ctx) {
    // TODO:
    app.go(HomePage, {})
}

module.exports = Router
