var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')

var SessionLocalService = function SessionLocalService() {
    this.ns = 'SessionLocalService'
}
_.extend(SessionLocalService, StaticMixin)

SessionLocalService.prototype.create_by_fb_access_token = function * (o) {
    var debug_token_response = yield FacebookHTTPClient.get_graph_debug_token({input_token: o.fb_access_token})
      , debug_token = debug_token_response && debug_token_response.body && debug_token_response.body.data

    if (!debug_token.is_valid) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Facebook access token is invalid.', 403)
    }

    var account = yield AccountLocalService.get_by_fb_id({
            fb_id: debug_token.user_id
        })

    if (!account) {
        throw new LocalServiceError(this.ns, 'access_denied', 'No account by provided facebook token.', 403)
    }

    if (account.fb_access_token !== o.fb_access_token) {
        // Update access token if necessary.
        account.updated_at = 'now()'
        account.fb_access_token = o.fb_access_token

        account = yield AccountLocalService.update_fb_access_token(account)
    }

    return yield this.create_by_account__session({account: account, session: o.session})
}

SessionLocalService.prototype.create = function * (o) {
    var account = yield AccountLocalService.get_by_username_password({
            username: o.username
          , password: o.password
        })

    if (!account) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Invalid username or password.', 403)
    }

    return yield this.create_by_account__session({account: account, session: o.session})
}

SessionLocalService.prototype.create_by_account__session = function * (o) {
    if (!o.account) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Invalid account.', 403)
    }

    o.session.account_id = o.account.id

    // TODO: should not really return account.
    return o.account
}

SessionLocalService.prototype.del = function * (o) {
    o.that.session = null
}

module.exports = SessionLocalService

var AccountLocalService = require('src/account/server/AccountLocalService').get_instance()
  , FacebookHTTPClient = require('src/facebook/server/FacebookHTTPClient').get_instance()
