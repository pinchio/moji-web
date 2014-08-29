var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')

var SessionLocalService = function SessionLocalService() {
    this.ns = 'SessionLocalService'
}
_.extend(SessionLocalService, StaticMixin)

SessionLocalService.prototype.create = function * (o) {
    var account = yield AccountLocalService.get_by_username_password({
            username: o.username
          , password: o.password
        })

    return yield this.create_by_account__session({account: account, session: o.session})
}

SessionLocalService.prototype.create_by_account__session = function * (o) {
    if (!o.account) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Invalid username or password', 403)
    }

    o.session.account_id = o.account.id

    return o.session
}

SessionLocalService.prototype.del = function * (o) {
    o.that.session = null
}

module.exports = SessionLocalService

var AccountLocalService = require('src/account/server/AccountLocalService').get_instance()
