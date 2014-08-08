var _ = require('underscore')
  , validator = require('validator')
  , LocalServiceError = require('src/common').LocalServiceError
  , EmojiCollectionPersistenceService = require('./EmojiCollectionPersistenceService').get_instance()
  , StaticMixin = require('../../common/StaticMixin')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , thunkify = require('thunkify')
  , EmojiCollection = require('./EmojiCollection')
  , fs = require('fs')
  , readFile_thunk = thunkify(fs.readFile)
  , AWS = require('aws-sdk')
  , config = require('../../../config')
  , path = require('path')
  , crypto = require('crypto')
  , Moment = require('moment')

var EmojiCollectionLocalService = function EmojiCollectionLocalService() {
    this.ns = 'EmojiCollectionLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(EmojiCollectionLocalService, StaticMixin)

EmojiCollectionLocalService.prototype.validate_session = function(session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

// EmojiCollectionLocalService.prototype.valid_display_name_regex = /^[A-Za-z0-9\s\-_,\.;:()]*$/
EmojiCollectionLocalService.prototype.valid_display_name_regex = /.*/

EmojiCollectionLocalService.prototype.validate_display_name = function(display_name) {
    if (_.isString(display_name) && display_name.length === 0) {
        return true
    }

    if (!validator.isLength(display_name, 0, 128)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Display name must be less than 129 characters.', 400)
    }

    if (!validator.matches(display_name, this.valid_display_name_regex)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Display name can only contain letters, numbers and standard punctuation.', 400)
    }
}

EmojiCollectionLocalService.prototype.validate_tags = function(tags) {
    if (!_.isArray(tags)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Tags must be an array.', 400)
    }

    for (var i = 0, ii = tags.length; i < ii; ++i) {
        var tag = tags[i]

        if (!validator.isAlphanumeric(tag)) {
            throw new LocalServiceError(this.ns, 'bad_request', 'Tags can only contain letters and numbers.', 400)
        }
    }
}

EmojiCollectionLocalService.prototype.valid_scopes = ['public_read']

EmojiCollectionLocalService.prototype.validate_scopes = function(scopes) {
    if (!_.isArray(scopes)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Scopes must be an array.', 400)
    }

    for (var i = 0, ii = scopes.length; i < ii; ++i) {
        var scope = scopes[i]

        if (this.valid_scopes.indexOf(scope) === -1) {
            throw new LocalServiceError(this.ns, 'bad_request', 'Invalid scope.', 400)
        }
    }
}

EmojiCollectionLocalService.prototype.validate_id = function(id) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Emoji collection ids contain more than 10 characters.', 400)
    }
}

EmojiCollectionLocalService.prototype.validate_created_by = function(id) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Emoji collection created by ids contain more than 10 characters.', 400)
    }
}

EmojiCollectionLocalService.prototype.create = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)

    this.validate_session(o.session)
    this.validate_display_name(o.display_name)
    this.validate_tags(o.tags)
    this.validate_scopes(o.scopes)

    var emoji_collection = EmojiCollection.from_create({
            slug_name: ''
          , display_name: o.display_name
          , tags: o.tags
          , scopes: o.scopes
          , created_by: o.session.account_id
        })
      , created_emoji_collections = yield EmojiCollectionPersistenceService.insert(emoji_collection)
      , emoji_collection = created_emoji_collections.first()

    return emoji_collection
}

EmojiCollectionLocalService.prototype._update = function * (o) {
    // Updating from the same original as db. Allow.
    var emoji_collection = EmojiCollection.from_update({
            id: o.id
          , created_at: o.created_at
          , updated_at: 'now()'
          , deleted_at: o.deleted_at
          , slug_name: ''
          , display_name: o.display_name
          , tags: o.tags
          , scopes: o.scopes
          , created_by: o.session.account_id
        })
      , updated_emoji_collections = yield EmojiCollectionPersistenceService.update_by_id(emoji_collection)
      , updated_emoji_collection = updated_emoji_collections.first()

      return updated_emoji_collection
}

EmojiCollectionLocalService.prototype.upsert = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)

    this.validate_id(o.id)
    this.validate_session(o.session)
    this.validate_display_name(o.display_name)
    this.validate_tags(o.tags)
    this.validate_scopes(o.scopes)
    this.validate_created_by(o.created_by)

    if (o.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
    }

    var db_emoji_collections = yield EmojiCollectionPersistenceService.select_by_id({id: o.id})
      , db_emoji_collection = db_emoji_collections.first()

    if (db_emoji_collection) {
        // Update.
        if (db_emoji_collection.deleted_at) {
            throw new LocalServiceError(this.ns, 'conflict', 'Cannot update deleted emoji collection.', 409)
        }

        if (db_emoji_collection.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        if (db_emoji_collection.updated_at.isSame(o.updated_at)) {
            o.created_at = db_emoji_collection.created_at
            return yield this._update(o)
        } else {
            // Updating from a stale version. Disallow. Return, db version.
            return db_emoji_collection
        }
    } else {
        // Create.
        var emoji_collection = EmojiCollection.from_create({
                id: o.id
              , slug_name: ''
              , display_name: o.display_name
              , tags: o.tags
              , scopes: o.scopes
              , created_by: o.session.account_id
            })
          , created_emoji_collections = yield EmojiCollectionPersistenceService.insert(emoji_collection)
          , created_emoji_collection = created_emoji_collections.first()

        return created_emoji_collection
    }
}

EmojiCollectionLocalService.prototype.get_by_id = function * (o) {
    this.validate_id(o.id)

    var emoji_collections = yield EmojiCollectionPersistenceService.select_by_id({id: o.id})
      , emoji_collection = emoji_collections.first()

    if (emoji_collection) {
        if (emoji_collection.deleted_at) {
            return null
        } else if (o.session.account_id === emoji_collection.created_by) {
            return emoji_collection
        } else if (emoji_collection.scopes.indexOf('public_read') > -1) {
            return emoji_collection
        } else {
            return null
        }
    } else {
        return null
    }
}

EmojiCollectionLocalService.prototype.get_by_created_by = function * (o) {
    this.validate_session(o.session)

    var emoji_collections = yield EmojiCollectionPersistenceService.select_by_created_by__not_deleted({
        created_by: o.session.account_id
    })

    return emoji_collections
}

EmojiCollectionLocalService.prototype.delete_by_id = function * (o) {
    this.validate_id(o.id)
    this.validate_session(o.session)

    var emoji_collections = yield EmojiCollectionPersistenceService.select_by_id({id: o.id})
      , emoji_collection = emoji_collections.first()

    if (emoji_collection) {
        if (emoji_collection.deleted_at) {
            return emoji_collection
        }

        // Cannot delete someone else's.
        if (emoji_collection.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        emoji_collection.deleted_at = 'now()'
        emoji_collection.session = o.session

        return yield this._update(emoji_collection)
    } else {
        return null
    }
}

module.exports = EmojiCollectionLocalService

var SessionLocalService = require('../../session/server/SessionLocalService').get_instance()
