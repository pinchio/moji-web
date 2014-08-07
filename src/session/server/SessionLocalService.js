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

    if (account) {
        o.session.account_id = account.id
    } else {
        throw new LocalServiceError(this.ns, 'access_denied', 'Invalid username or password', 403)
    }
}

module.exports = SessionLocalService

var AccountLocalService = require('src/account').AccountLocalService.get_instance()
