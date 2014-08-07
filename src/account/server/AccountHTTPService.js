var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , AccountLocalService = require('./AccountLocalService').get_instance()

var AccountHTTPService = function AccountHTTPService() {
    this.ns = 'AccountHTTPService'
}
_.extend(AccountHTTPService, StaticMixin)
_.extend(AccountHTTPService.prototype, HTTPServiceMixin.prototype)
// TODO: bring back this.req

AccountHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield AccountLocalService.get_by_id({
                    req: this.request
                  , id: this.params.id
                })

            if (account) {
                if (this.session.account_id === account.id) {
                    return self.handle_success(this, {account: account.to_privileged()}, 'json')
                } else {
                    return self.handle_success(this, {account: account.to_json()}, 'json')
                }
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

AccountHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield AccountLocalService.create({
                    username: this.request.body && this.request.body.username
                  , password: this.request.body && this.request.body.password
                  , email: this.request.body && this.request.body.email
                  , full_name: this.request.body && this.request.body.full_name
                  , born_at: this.request.body && this.request.body.born_at
                  , session: this.session
                })

            self.handle_success(this, {account: account.to_privileged()}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = AccountHTTPService
