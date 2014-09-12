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
      , 'fb_id'
      , 'fb_access_token'
      , 'extra_data'
    ]
    this.table = 'account'
    this.clazz = Accounts
}
_.extend(AccountPersistenceService, StaticMixin)
_.extend(AccountPersistenceService.prototype, QueryMixin.prototype)

AccountPersistenceService.prototype.select_by_fb_id = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where fb_id = $1 '
      , values = [req.fb_id]

    return yield this.query({query: query, values: values})
}

AccountPersistenceService.prototype.select_by_username = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where username = $1 '
      , values = [req.username]

    return yield this.query({query: query, values: values})
}

AccountPersistenceService.prototype.select_by_query = function * (req) {
   var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where ('
                  + 'to_tsvector(\'english\', username) '
                  + '@@ to_tsquery(\'english\', $1) or '
                  + 'to_tsvector(\'english\', full_name) '
                  + '@@ to_tsquery(\'english\', $1)'
              + ') '
              + 'order by updated_at desc '
              + 'limit 100'
      , values = [req.query]

    return yield this.query({query: query, values: values})
}

module.exports = AccountPersistenceService
