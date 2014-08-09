var _ = require('underscore')
  , QueryMixin = require('src/common').QueryMixin
  , Accounts = require('./Accounts')
  , StaticMixin = require('../../common/StaticMixin')

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
