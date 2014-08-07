var _ = require('underscore')
  , validator = require('validator')
  , LocalServiceError = require('src/common').LocalServiceError
  , StaticMixin = require('../../common/StaticMixin')

var SessionLocalService = function SessionLocalService() {
    this.ns = 'SessionLocalService'
}
_.extend(SessionLocalService, StaticMixin)

SessionLocalService.prototype.create = function * (o) {
    var account = yield AccountLocalService.get_by_username_password({
            username: o.username
          , password: o.password
        })

    return yield this.create_by_account_session({account: account, session: o.session})
}

SessionLocalService.prototype.create_by_account_session = function * (o) {
    var account = o.account

    if (account) {
        o.session.account_id = account.id
    } else {
        throw new LocalServiceError(this.ns, 'access_denied', 'Invalid username or password', 403)
    }
}

SessionLocalService.prototype.del = function * (o) {
    o.that.session = null
}

module.exports = SessionLocalService

var AccountLocalService = require('../../account/server/AccountLocalService').get_instance()
