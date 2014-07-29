var koa = require('koa')
  , koa_compress = require('koa-compress')
  , koa_logger = require('koa-logger')
  , koa_static = require('koa-static')
  , koa_trie_router = require('koa-trie-router')
  , parse = require('co-body')
  , path = require('path')
  , HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , routes = require('src/common/routes')
  , StaticMixin = require('../../common/StaticMixin')
  , config = require('../../../config')

var Server = function Server() {
    var self = this
    this.app = koa()

    var static_folder_name = path.join(process.env.NODE_PATH, '/public')

    this.app.use(koa_logger())
    if (config.get('env') === 'development') {
        // So we can use koa-gzip as a npm devDependency.
        var koa_gzip = require('koa-gzip')
        this.app.use(koa_gzip())
    }
    this.app.use(koa_static(static_folder_name, {maxage: 1000 * 60 * 60 * 24 * 365}))
    this.app.use(koa_trie_router(this.app))

    // API routes
    // this.app.route('/_/api/users/123').get(QuoteHTTPService.get())

    // URL routes
    routes.forEach(function(route_config) {
        self.app.route(route_config.route).get(HomeHTTPService.get())
    })
}
_.extend(Server, StaticMixin)

Server.prototype.listen = function(port, host) {
    console.log('Starting server on ' + host + ':' + port)
    this.app.listen.apply(this.app, arguments)
}

module.exports = Server

var HomeHTTPService = require('src/home').HomeHTTPService.get_instance()
