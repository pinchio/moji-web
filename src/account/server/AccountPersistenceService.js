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
      , 'roles'
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

AccountPersistenceService.prototype.insert_mojigram = function * (req) {
    var query = "INSERT INTO account (id, created_at, updated_at, username, email, full_name, password, profile_image_url, born_at, roles, extra_data) values ('d23cadef-bacc-43d1-a5b9-4f53185fb710', now(), now(), 'mojigram', 'mojigram@gmail.com', 'mojigram', '57sVeyJf7UVDAPwKtvdGpqXPmFewcdv4sJkcDYybkqyQbf8RaNVO2te22DfwvmZFowrX52m2kf89bFi2q18nA53SdCqTA1+8fze9c/+6uGD8RFvzUE11qBnC5rvG14p1B3m5q22+dkU0ZvrKOKHVGgcM4pyXjyDaRV61ktQV7xieFH+NNN1yRjPtxYMPBW3nycfnE8sqOnzrlmynOMyLXxLmOgX0hZvSylGJsszy6givOi+NoRQVWHJRf5FKZBQKGHmOljs0o+qlqyIpyfF7pxRNJbwwQTc2pw2co5/zfHeVajbAEwXIcyBRJvfJjUcY3mSzZLdDKiZPGo9OjwvLiQ==:2710.M474tosHIV4yjQDRANdnjsDczzrBvliC5kAr0CZEcI8=', null, null, 1, '{}')"
      , values = []

    return yield this.query({query: query, values: values})
}



module.exports = AccountPersistenceService
