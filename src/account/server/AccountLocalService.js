var _ = require('underscore')
  , LocalServiceError = require('src/common').LocalServiceError
  , AccountPersistenceService = require('./AccountPersistenceService').get_instance()
  , StaticMixin = require('../../common/StaticMixin')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 100000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , thunkify = require('thunkify')
  , Account = require('./Account')

var AccountLocalService = function AccountLocalService() {
    this.ns = 'AccountLocalService'
}
_.extend(AccountLocalService, StaticMixin)

// TODO: Account name cannot be login, logout, username
// TODO: Should not leak password to client

AccountLocalService.prototype.get_by_id = function * (o) {
}

AccountLocalService.prototype.create_password_hash_salt = thunkify(function(password, cb) {
    easy_pbkdf2.secureHash(password, function(err, hash, salt) {
        return cb(err, hash + ':' + salt)
    })
})

AccountLocalService.prototype.create = function * (o) {
    // Username regex: ^(\w){1,15}$
    // Max password length.
    // password regex:
    //    function checkPwd(str) {
    //     if (str.length < 6) {
    //         return("too_short");
    //     } else if (str.length > 50) {
    //         return("too_long");
    //     } else if (str.search(/\d/) == -1) {
    //         return("no_num");
    //     } else if (str.search(/[a-zA-Z]/) == -1) {
    //         return("no_letter");
    //     } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\&\*\(\)\_\+]/) != -1) {
    //         return("bad_char");
    //     }
    //     return("ok");
    // }

    // username set?
    // alpha numeric characters for password?
    // full_name optional
    // born_at optional

    // console.log(o)
    // TODO: some validation.

    var account = Account.from_create({
            username: o.username
          , full_name: o.full_name
          , password: hash_salt
          , born_at: o.born_at
        })

    var hash_salt = yield this.create_password_hash_salt(o.password)
      , account = Account.from_create({
            username: o.username
          , full_name: o.full_name
          , password: hash_salt
          , born_at: o.born_at
        })
      , created_accounts = yield AccountPersistenceService.insert(account)

    return (created_accounts && created_accounts.list.length === 1) ? created_accounts.list[0] : null
}

module.exports = AccountLocalService
