var _ = require('underscore')
  , Accounts = require('./Accounts')
  , QueryMixin = require('src/common/server/QueryMixin')
  , StaticMixin = require('src/common/StaticMixin')

var AccountPersistenceService = function AccountPersistenceService() {
    this.ns = 'AccountPersistenceService'
    this.columns = [
        'id'
      , 'created_at'
      , 'updated_at'
      , 'username'
      , 'email'
      , 'full_name'
      , 'password'
      , 'profile_image_url'
      , 'born_at'
      , 'extra_data'
    ]
    this.table = 'account'
    this.clazz = Accounts
}
_.extend(AccountPersistenceService, StaticMixin)
_.extend(AccountPersistenceService.prototype, QueryMixin.prototype)

AccountPersistenceService.prototype.select_by_username = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where username = $1 '
      , values = [req.username]

    return yield this.query({query: query, values: values})
}

module.exports = AccountPersistenceService
