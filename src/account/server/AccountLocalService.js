var _ = require('underscore')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')
  , thunkify = require('thunkify')
  , uuid = require('node-uuid')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var AccountLocalService = function AccountLocalService() {
    this.ns = 'AccountLocalService'
    this.mojigram_account_id = 'd23cadef-bacc-43d1-a5b9-4f53185fb710'
}
_.extend(AccountLocalService, StaticMixin)
_.extend(AccountLocalService.prototype, ValidationMixin.prototype)

AccountLocalService.prototype.get_roles_bitmap = function(roles) {
    // TODO: fix.
    var bitmap = 0
    if (roles.ADMIN) {
        bitmap += 1
    } else if (roles.GUEST) {
        bitmap += 10
    }

    return bitmap
}

AccountLocalService.prototype.create_password_hash_salt = thunkify(function(password, cb) {
    easy_pbkdf2.secureHash(password, function(err, hash, salt) {
        return cb(err, hash + ':' + salt)
    })
})

AccountLocalService.prototype.get_by_id = function * (o) {
    yield this.validate_uuid(o.id, 'Id')

    var account = (yield AccountPersistenceService.select_by_id({id: o.id})).first()

    return account
}

AccountLocalService.prototype.create = function * (o) {
    o.extra_data = o.extra_data || {}

    // TODO: Account name cannot be login, logout, username
    yield this.validate_username(o.username)
    yield this.validate_password(o.password)
    yield this.validate_email(o.email)

    if (o.profile_image_url) {
        yield this.validate_asset_url(o.profile_image_url, 'Profile image url')
    }

    var hash_salt = yield this.create_password_hash_salt(o.password)
      , account = Account.from_create({
            username: o.username
          , password: hash_salt
          , email: o.email
          , full_name: o.full_name
          , profile_image_url: o.profile_image_url
          , born_at: o.born_at
          , roles: 0
          , extra_data: o.extra_data
        })

    try {
        var account = (yield AccountPersistenceService.insert(account)).first()
    } catch (e) {
        if (e && e.type === 'db_duplicate_key_error') {
            if (e.detail) {
                if (e.detail.key === 'username') {
                    throw new LocalServiceError(this.ns, 'conflict', 'Username is taken.', 409)
                } else if (e.detail.key === 'email') {
                    throw new LocalServiceError(this.ns, 'conflict', 'Email is taken.', 409)
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

    yield SessionLocalService.create_by_account__session({
        account: account
      , session: o.session
    })

    return account
}

AccountLocalService.prototype.create_by_fb_access_token = function * (o) {
    o.extra_data = o.extra_data || {}

    yield this.validate_username(o.username)

    // FIXME:
    // validate fb_access_token?
    yield this.validate_email(o.email)

    if (o.profile_image_url) {
        yield this.validate_asset_url(o.profile_image_url, 'Profile image url')
    }

    var debug_token_response = yield FacebookHTTPClient.get_graph_debug_token({input_token: o.fb_access_token})
      , debug_token = debug_token_response && debug_token_response.body && debug_token_response.body.data

    if (!debug_token.is_valid) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Facebook access token is invalid.', 401)
    }

    var account = Account.from_create({
            username: o.username
          , email: o.email
          , full_name: o.full_name
          , profile_image_url: o.profile_image_url
          , born_at: o.born_at
          , fb_id: debug_token.user_id
          , fb_access_token: o.fb_access_token
          , roles: 0
          , extra_data: o.extra_data
        })

    try {
        var account = (yield AccountPersistenceService.insert(account)).first()
    } catch (e) {
        if (e && e.type === 'db_duplicate_key_error') {
            if (e.detail) {
                if (e.detail.key === 'username') {
                    throw new LocalServiceError(this.ns, 'conflict', 'Username is taken.', 409)
                } else if (e.detail.key === 'email') {
                    throw new LocalServiceError(this.ns, 'conflict', 'Email is taken.', 409)
                } else if (e.detail.key === 'fb_id') {
                    throw new LocalServiceError(this.ns, 'conflict', 'Facebook id is associated with an existing account.', 409)
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

    yield SessionLocalService.create_by_account__session({
        account: account
      , session: o.session
    })

    return account
}

AccountLocalService.prototype.create_guest = function * (o) {
    o.extra_data = o.extra_data || {}

    var account = Account.from_create({
            roles: this.get_roles_bitmap({GUEST: true})
        })
      , created_account = (yield AccountPersistenceService.insert(account)).first()

    yield SessionLocalService.create_by_account__session({
        account: created_account
      , session: o.session
    })

    // Follow some of the existing collections owned by @mojigram.
    var emoji_collections = yield EmojiCollectionLocalService.get_by_created_by__scopes({
        created_by: this.mojigram_account_id
      , scopes: ['public_read']
      , session: o.session
    })

    // Only follow mojiboard specific collections.
    var filtered_emoji_collections = yield emoji_collections.filter_for_mojiboard()
    var filtered_emoji_collections_ids = yield filtered_emoji_collections.get_ids()
    var gen_emoji_collection_followers = filtered_emoji_collections_ids.map(function(emoji_collection_id) {
                return EmojiCollectionFollowerLocalService.create({
                    session: o.session
                  , emoji_collection_id: emoji_collection_id
                })
            })
      , followed_emoji_collections = yield gen_emoji_collection_followers

    return created_account
}

AccountLocalService.prototype.update = function * (o) {
    o.extra_data = o.extra_data || {}

    // TODO: validation for other fields.
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.id, 'Id')
    yield this.validate_password(o.password)
    yield this.validate_email(o.email)

    if (o.profile_image_url) {
        yield this.validate_asset_url(o.profile_image_url, 'Profile image url')
    }

    var current_account = (yield AccountPersistenceService.select_by_id({id: o.id})).first()

    yield this.validate_exists(current_account)
    yield this.validate_can_edit(current_account.id, o.session.account_id)

    var hash_salt = yield this.create_password_hash_salt(o.password)
      , account = Account.from_update({
            id: o.id
          , created_at: current_account.created_at
          , updated_at: 'now()'
          , username: o.username
          , password: hash_salt
          , email: o.email
          , full_name: o.full_name
          , profile_image_url: o.profile_image_url
          , born_at: o.born_at
          , fb_access_token: o.fb_access_token
          , extra_data: o.extra_data
        })
      , updated_account = (yield AccountPersistenceService.update_by_id(account)).first()
      , session = yield SessionLocalService.create_by_account__session({
            account: updated_account
          , session: o.session
        })

    return updated_account
}

AccountLocalService.prototype.update_fb_access_token = function * (o) {
    var updated_account = (yield AccountPersistenceService.update_by_id(o)).first()

    return updated_account
}

AccountLocalService.prototype.get_by_username_password = function * (o) {
    // Should not select by username, password because the validate method will probably work against other pw.
    yield this.validate_username(o.username)
    yield this.validate_password(o.password)

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

AccountLocalService.prototype.get_by_fb_id = function * (o) {
    // TODO: validate token
    var account = (yield AccountPersistenceService.select_by_fb_id({
            fb_id: o.fb_id
        })).first()

    return account
}

AccountLocalService.prototype.get_by_query = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_query(o.query)

    var accounts = yield AccountPersistenceService.select_by_query({
            query: o.query
        })

    return accounts
}

module.exports = AccountLocalService

var Account = require('./Account')
  , EmojiCollections = require('../../emoji_collection/server/EmojiCollections')
  , AccountPersistenceService = require('./AccountPersistenceService').get_instance()
  , EmojiCollectionLocalService = require('../../emoji_collection/server/EmojiCollectionLocalService').get_instance()
  , EmojiCollectionFollowerLocalService = require('../../emoji_collection_follower/server/EmojiCollectionFollowerLocalService').get_instance()
  , FacebookHTTPClient = require('src/facebook/server/FacebookHTTPClient').get_instance()
  , SessionLocalService = require('src/session/server/SessionLocalService').get_instance()
