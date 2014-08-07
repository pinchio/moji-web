var _ = require('underscore')
  , validator = require('validator')
  , LocalServiceError = require('src/common').LocalServiceError
  , AccountPersistenceService = require('./AccountPersistenceService').get_instance()
  , StaticMixin = require('../../common/StaticMixin')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , thunkify = require('thunkify')
  , Account = require('./Account')

// 400 Bad input parameter. Error message should indicate which one and why.
// 401 Bad or expired token. This can happen if the user or Dropbox revoked or expired an access token. To fix, you should re-authenticate the user.
// 403 Bad OAuth request (wrong consumer key, bad nonce, expired timestamp...). Unfortunately, re-authenticating the user won't help here.
// 404 File or folder not found at the specified path.
// 405 Request method not expected (generally should be GET or POST).
// 429 Your app is making too many requests and is being rate limited. 429s can trigger on a per-app or per-user basis.
// 503 If the response includes the Retry-After header, this means your OAuth 1.0 app is being rate limited. Otherwise, this indicates a transient server error, and your app should retry its request.
// 507 User is over Dropbox storage quota.
// 5xx Server error. Check DropboxOps.

var AccountLocalService = function AccountLocalService() {
    this.ns = 'AccountLocalService'
}
_.extend(AccountLocalService, StaticMixin)

AccountLocalService.prototype.validate_username = function(username) {
    if (!validator.isLength(username, 3, 15)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Username must be between 3 and 15 characters.', 400)
    }

    if (!validator.isAlphanumeric(username)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Username can only contain letters and numbers.', 400)
    }
}

AccountLocalService.prototype.validate_password = function(password) {
    if (!validator.isLength(password, 8, 32)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Password must be between 8 and 32 characters.', 400)
    }

    if (!validator.isAlphanumeric(password)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Password can only contain letters and numbers.', 400)
    }
}

AccountLocalService.prototype.validate_email = function(email) {
    if (!validator.isEmail(email)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Email is not valid.', 400)
    }
}

AccountLocalService.prototype.create_password_hash_salt = thunkify(function(password, cb) {
    easy_pbkdf2.secureHash(password, function(err, hash, salt) {
        return cb(err, hash + ':' + salt)
    })
})

AccountLocalService.prototype.validate_password_hash_salt = thunkify(function(password, expected_password, cb) {
    var hash_salt = expected_password.split(':')

    easy_pbkdf2.verify(hash_salt[1], hash_salt[0], password, function(err, valid) {
        return cb(err, valid)
    })
})

AccountLocalService.prototype.get_by_id = function * (o) {
    if (!validator.isLength(o.id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Account ids contain more than 10 characters.', 400)
    }

    var accounts = yield AccountPersistenceService.select_by_id({id: o.id})

    return (accounts && accounts.list.length === 1) ? accounts.list[0] : null
}

AccountLocalService.prototype.create = function * (o) {
    // TODO: Account name cannot be login, logout, username
    this.validate_username(o.username)
    this.validate_password(o.password)
    this.validate_email(o.email)

    var self = this
      , hash_salt = yield this.create_password_hash_salt(o.password)
      , account = Account.from_create({
            username: o.username
          , password: hash_salt
          , email: o.email
          , full_name: o.full_name
          , born_at: o.born_at
        })

    try {
        var created_accounts = yield AccountPersistenceService.insert(account)
          , account = (created_accounts && created_accounts.list.length === 1) ? created_accounts.list[0] : null
          , session = yield SessionLocalService.create_by_account_session({
                account: account
              , session: o.session
            })
    } catch (e) {
        if (e && e.type === 'db_duplicate_key_error') {
            if (e.detail) {
                if (e.detail.key === 'username') {
                    throw new LocalServiceError(self.ns, 'conflict', 'Username is taken.', 409)
                } else if (e.detail.key === 'email') {
                    throw new LocalServiceError(self.ns, 'conflict', 'Email is taken.', 409)
                } else {
                    throw e
                }
            } else {
                throw e
            }
        } else {
            throw e
        }
    }

    return account
}

AccountLocalService.prototype.get_by_username_password = function * (o) {
    // Should not select by username, password because the validate method will probably work against other pw.
    this.validate_username(o.username)
    this.validate_password(o.password)

    var accounts = yield AccountPersistenceService.select_by_username({
            username: o.username
        })

    if (!accounts.list.length) {
        return null
    }

    var account = accounts.list[0]
      , is_valid = yield this.validate_password_hash_salt(o.password, account.password)

    if (is_valid) {
        return account
    } else {
        return null
    }
}

module.exports = AccountLocalService

var SessionLocalService = require('../../session/server/SessionLocalService').get_instance()
