var _ = require('underscore')
  , AccountLocalService = require('./AccountLocalService').get_instance()
  , HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , StaticMixin = require('src/common/StaticMixin')

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
                    req: this.request
                  , id: this.params.id
                })

            if (!account) {
                return self.handle_success(this, null)
            }

            return self.handle_success(this, {account: yield account.to_json({session: this.session})}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

AccountHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            if (this.request.body.fb_access_token) {
                var account = yield AccountLocalService.create_by_fb_access_token({
                        username: this.request.body && this.request.body.username
                      , fb_access_token: this.request.body && this.request.body.fb_access_token
                      , email: this.request.body && this.request.body.email
                      , full_name: this.request.body && this.request.body.full_name
                      , profile_image_url: this.request.body && this.request.body.profile_image_url
                      , born_at: this.request.body && this.request.body.born_at
                      , session: this.session
                    })
            } else if (this.request.query.guest === 'true') {
                var account = yield AccountLocalService.create_guest({
                        session: this.session
                    })
            } else {
                var account = yield AccountLocalService.create({
                        username: this.request.body && this.request.body.username
                      , password: this.request.body && this.request.body.password
                      , email: this.request.body && this.request.body.email
                      , full_name: this.request.body && this.request.body.full_name
                      , profile_image_url: this.request.body && this.request.body.profile_image_url
                      , born_at: this.request.body && this.request.body.born_at
                      , session: this.session
                    })
            }

            self.handle_success(this, {account: yield account.to_json({session: this.session})}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

AccountHTTPService.prototype.put = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield AccountLocalService.update({
                    id: this.params.id
                  , password: this.request.body && this.request.body.password
                  , email: this.request.body && this.request.body.email
                  , full_name: this.request.body && this.request.body.full_name
                  , profile_image_url: this.request.body && this.request.body.profile_image_url
                  , born_at: this.request.body && this.request.body.born_at
                  , session: this.session
                })

            self.handle_success(this, {account: yield account.to_json({session: this.session})}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = AccountHTTPService
