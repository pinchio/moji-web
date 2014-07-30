var _ = require('underscore')
  , QueryMixin = require('src/common').QueryMixin
  , Accounts = require('./Accounts')
  , StaticMixin = require('../../common/StaticMixin')

var AccountPersistenceService = function AccountPersistenceService() {
    this.ns = 'AccountPersistenceService'
    this.columns = ['id', 'created_at', 'updated_at', 'username', 'full_name', 'password', 'born_at']
    this.table = 'account'
    this.clazz = Accounts
}
_.extend(AccountPersistenceService, StaticMixin)
_.extend(AccountPersistenceService.prototype, QueryMixin.prototype)

module.exports = AccountPersistenceService
