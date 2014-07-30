var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , AccountLocalService = require('./AccountLocalService').get_instance()

var AccountHTTPService = function AccountHTTPService() {
    this.ns = 'AccountHTTPService'
}
_.extend(AccountHTTPService, StaticMixin)
_.extend(AccountHTTPService.prototype, HTTPServiceMixin.prototype)

AccountHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield AccountLocalService.get_by_id({
                    req: self.request
                  , id: self.id
                })

            self.handle_success(this, {account: account}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

// TODO: bring back this.req
AccountHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield AccountLocalService.create({
                    username: this.request.body && this.request.body.username
                  , full_name: this.request.body && this.request.body.full_name
                  , password: this.request.body && this.request.body.password
                  , born_at: this.request.body && this.request.body.born_at
                })

            self.handle_success(this, {account: account.to_json()}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

    // this.app.route('/_/api/account/:id').get(AccountHTTPService.get())
    // this.app.route('/_/api/account/username/:username').get(AccountHTTPService.get_by_username())

    // this.app.route('/_/api/account/login').post(AccountHTTPService.login())
    // this.app.route('/_/api/account/logout').post(AccountHTTPService.logout())
    // this.app.route('/_/api/account').post(AccountHTTPService.post())

    // this.app.route('/_/api/account/:id').put(AccountHTTPService.put())

module.exports = AccountHTTPService
