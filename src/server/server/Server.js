var koa = require('koa')
  , koa_body_parser = require('koa-body-parser')
  , koa_compress = require('koa-compress')
  , koa_logger = require('koa-logger')
  , koa_session = require('koa-session')
  , koa_static = require('koa-static')
  , koa_trie_router = require('koa-trie-router')
  , path = require('path')
  , HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , _ = require('underscore')
  , routes = require('src/common/routes')
  , StaticMixin = require('src/common/StaticMixin')
  , config = require('../../../config')
  , http = require('http')
  , static_folder_name = path.join(process.env.NODE_PATH, '/public')
  , Moment = require('moment')

var Server = function Server() {
    var self = this

    this.app = koa()
    this.app.keys = ['m0j1gr@m']
    this.app.use(koa_logger())

    if (config.get('env') === 'development') {
        // So we can use koa-gzip as a npm devDependency.
        var koa_gzip = require('koa-gzip')
        this.app.use(koa_gzip())
    }
    this.app.use(koa_body_parser())
    this.app.use(koa_static(static_folder_name, {maxage: 1000 * 60 * 60 * 24 * 365}))
    this.app.use(koa_session({
        expires: (new Moment()).add(10, 'year').toDate()
    }))
    this.app.use(function * (next) {
        console.log('method', this.request.method)
        console.log('url', this.request.url)
        console.log('header', this.request.header)
        console.log('session', this.session)
        console.log('body', this.request.body)
        yield next
    })
    this.app.use(koa_trie_router(this.app))

    // API routes
    this.app.route('/_/api/account').post(AccountHTTPService.post())

    this.app.route('/_/api/account/:id').get(AccountHTTPService.get())
    this.app.route('/_/api/account/:id').put(AccountHTTPService.put())

    this.app.route('/_/api/session').post(SessionHTTPService.post())
    this.app.route('/_/api/session').del(SessionHTTPService.del())

    this.app.route('/_/api/asset').post(AssetHTTPService.post())

    this.app.route('/_/api/emoji_collection').post(EmojiCollectionHTTPService.post())
    this.app.route('/_/api/emoji_collection').get(EmojiCollectionHTTPService.list())

    this.app.route('/_/api/emoji_collection/:id').put(EmojiCollectionHTTPService.put())
    this.app.route('/_/api/emoji_collection/:id').get(EmojiCollectionHTTPService.get())
    this.app.route('/_/api/emoji_collection/:id').del(EmojiCollectionHTTPService.del())

    this.app.route('/_/api/emoji').post(EmojiHTTPService.post())
    this.app.route('/_/api/emoji').get(EmojiHTTPService.list())

    // this.app.route('/_/api/emoji/:id').put(EmojiHTTPService.put())
    this.app.route('/_/api/emoji/:id').get(EmojiHTTPService.get())
    this.app.route('/_/api/emoji/:id').del(EmojiHTTPService.del())

    this.app.route('/_/api/search').get(SearchHTTPService.list())
    this.app.route('/_/api/featured').get(FeaturedHTTPService.list())

    this.app.route('/_/api/event').post(EventHTTPService.post())

    this.app.route('/_/api/emoji_collection_follower').post(EmojiCollectionFollowerHTTPService.post())
    this.app.route('/_/api/emoji_collection_follower/:id').get(EmojiCollectionFollowerHTTPService.get())
    this.app.route('/_/api/emoji_collection_follower/:id').del(EmojiCollectionFollowerHTTPService.del())

    // URL routes
    routes.forEach(function(route_config) {
        self.app.route(route_config.route).get(HomeHTTPService.get())
    })
}
_.extend(Server, StaticMixin)

Server.prototype.listen = function(port, host) {
    console.log('Starting server on ' + host + ':' + port)
    this.http_server = http.createServer(this.app.callback()).listen(port, host)
}

Server.prototype.close = function() {
    console.log('Stopping server')
    this.http_server.close()
}

module.exports = Server

var AccountHTTPService = require('src/account/server/AccountHTTPService').get_instance()
  , AssetHTTPService = require('src/asset/server/AssetHTTPService').get_instance()
  , EmojiHTTPService = require('src/emoji/server/EmojiHTTPService').get_instance()
  , EmojiCollectionHTTPService = require('src/emoji_collection/server/EmojiCollectionHTTPService').get_instance()
  , EmojiCollectionFollowerHTTPService = require('src/emoji_collection_follower/server/EmojiCollectionFollowerHTTPService').get_instance()
  , EventHTTPService = require('src/event/server/EventHTTPService').get_instance()
  , FeaturedHTTPService = require('src/featured/server/FeaturedHTTPService').get_instance()
  , HomeHTTPService = require('src/home/server/HomeHTTPService').get_instance()
  , SearchHTTPService = require('src/search/server/SearchHTTPService').get_instance()
  , SessionHTTPService = require('src/session/server/SessionHTTPService').get_instance()
