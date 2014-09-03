var _ = require('underscore')
  , EventLocalService = require('./EventLocalService').get_instance()
  , HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , StaticMixin = require('src/common/StaticMixin')

var EventHTTPService = function EventHTTPService() {
    this.ns = 'EventHTTPService'
}
_.extend(EventHTTPService, StaticMixin)
_.extend(EventHTTPService.prototype, HTTPServiceMixin.prototype)

EventHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            var event = yield EventLocalService.create({
                    event: this.request.body && this.request.body.event
                  , properties: this.request.body && this.request.body.properties
                  , session: this.session
                })

            return self.handle_success(this, {}, 'json')
        } catch(e) {
            return self.handle_exception(this, e)
        }
    }
}

module.exports = EventHTTPService
