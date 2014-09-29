var HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , _ = require('underscore')
  , StaticMixin = require('src/common/StaticMixin')

var HomeHTTPService = function HomeHTTPService() {
    this.ns = 'HomeHTTPService'
}
_.extend(HomeHTTPService, StaticMixin)
_.extend(HomeHTTPService.prototype, HTTPServiceMixin.prototype)

HomeHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var page = yield HomeLocalService.get_page()
            self.handle_success(this, page)
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

HomeHTTPService.prototype.tos = function() {
    var self = this

    return function * (next) {
        try {
            var page = yield HomeLocalService.get_html({file_name: 'tos.html'})
            self.handle_success(this, page)
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = HomeHTTPService

var HomeLocalService = require('./HomeLocalService').get_instance()
