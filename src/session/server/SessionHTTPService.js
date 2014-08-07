var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , SessionLocalService = require('./SessionLocalService').get_instance()

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

            self.handle_success(this, {}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = SessionHTTPService
