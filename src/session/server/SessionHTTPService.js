var HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , _ = require('underscore')
  , StaticMixin = require('src/common/StaticMixin')

var SessionHTTPService = function SessionHTTPService() {
    this.ns = 'SessionHTTPService'
}
_.extend(SessionHTTPService, StaticMixin)
_.extend(SessionHTTPService.prototype, HTTPServiceMixin.prototype)

SessionHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield SessionLocalService.create({
                    username: this.request.body && this.request.body.username
                  , password: this.request.body && this.request.body.password
                  , session: this.session
                })

            self.handle_success(this, {account: account.to_privileged()}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

SessionHTTPService.prototype.del = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield SessionLocalService.del({
                    that: this
                })

            self.handle_success(this, {}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = SessionHTTPService

var SessionLocalService = require('./SessionLocalService').get_instance()
