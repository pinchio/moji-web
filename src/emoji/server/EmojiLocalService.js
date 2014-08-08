var _ = require('underscore')
  , validator = require('validator')
  , LocalServiceError = require('src/common').LocalServiceError
  , EmojiPersistenceService = require('./EmojiPersistenceService').get_instance()
  , StaticMixin = require('../../common/StaticMixin')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , thunkify = require('thunkify')
  , Emoji = require('./Emoji')
  , fs = require('fs')
  , readFile_thunk = thunkify(fs.readFile)
  , AWS = require('aws-sdk')
  , config = require('../../../config')
  , path = require('path')
  , crypto = require('crypto')

var EmojiLocalService = function EmojiLocalService() {
    this.ns = 'EmojiLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(EmojiLocalService, StaticMixin)

EmojiLocalService.prototype.validate_session = function(session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

// EmojiLocalService.prototype.valid_display_name_regex = /^[A-Za-z0-9\s\-_,\.;:()]*$/
EmojiLocalService.prototype.valid_display_name_regex = /.*/

EmojiLocalService.prototype.validate_display_name = function(display_name) {
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

EmojiLocalService.prototype.validate_tags = function(tags) {
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

EmojiLocalService.prototype.valid_scopes = ['public_read']

EmojiLocalService.prototype.validate_scopes = function(scopes) {
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

EmojiLocalService.prototype.validate_id = function(id) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Emoji ids contain more than 10 characters.', 400)
    }
}

EmojiLocalService.prototype.validate_emoji_collection_id = function(emoji_collection_id) {
    if (!validator.isLength(emoji_collection_id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Emoji collection ids contain more than 10 characters.', 400)
    }
}

EmojiLocalService.prototype.validate_created_by = function(id) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Emoji collection created by ids contain more than 10 characters.', 400)
    }
}

EmojiLocalService.prototype.valid_file_extensions = ['.png', '.jpg', '.jpeg', 'gif']
EmojiLocalService.prototype.validate_file_name = function(file_name) {
    if (!file_name) {
        throw new LocalServiceError(this.ns, 'bad_request', 'File name is required.', 400)
    }

    var ext = path.extname(file_name)

    if (this.valid_file_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset extension not supported.', 400)
    }
}

EmojiLocalService.prototype.get_file_sha = function(file_data) {
    return crypto.createHash('sha1').update(file_data).digest('hex')
}

EmojiLocalService.prototype.create = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)

    this.validate_session(o.session)
    this.validate_display_name(o.display_name)
    this.validate_tags(o.tags)
    this.validate_scopes(o.scopes)
    this.validate_emoji_collection_id(o.emoji_collection_id)
    this.validate_file_name(o.original_file_name)

    // Make sure emoji collection exists.
    var emoji_collection = yield EmojiCollectionLocalService.get_by_id({
            id: o.emoji_collection_id
          , session: o.session
        })

    if (!emoji_collection) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Invalid emoji collection id.', 400)
    }

    if (emoji_collection.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Not authorized to create emoji in this collection.', 403)
    }

    var file_data = yield readFile_thunk(o.local_file_name)
      , original_file_name_ext = path.extname(o.original_file_name)
      , s3_file_name = this.get_file_sha(file_data) + original_file_name_ext
      , put_response = yield this.s3_bucket_put_object({
            Key: s3_file_name
          , Body: file_data
        })

    var emoji = Emoji.from_create({
            slug_name: o.slug_name
          , display_name: o.display_name
          , tags: o.tags
          , scopes: o.scopes
          , created_by: o.session.account_id
          , asset_url: this.s3_base_url + s3_file_name
          , emoji_collection_id: o.emoji_collection_id
        })
      , created_emojis = yield EmojiPersistenceService.insert(emoji)
      , emoji = created_emojis.first()

    return emoji
}

EmojiLocalService.prototype._update = function * (o) {
    var emoji = Emoji.from_update({
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
      , updated_emojis = yield EmojiPersistenceService.update_by_id(emoji)
      , updated_emoji = updated_emojis.first()

      return updated_emoji_collection
}

EmojiLocalService.prototype.upsert = function * (o) {
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

    var db_emojis = yield EmojiPersistenceService.select_by_id({id: o.id})
      , db_emoji = db_emojis.first()

    if (db_emoji) {
        // Update.
        if (db_emoji.deleted_at) {
            throw new LocalServiceError(this.ns, 'conflict', 'Cannot update deleted emoji.', 409)
        }

        if (db_emoji.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        if (db_emoji.updated_at.isSame(o.updated_at)) {
            o.created_at = db_emoji_collection.created_at
            return yield this._update(o)
        } else {
            // Updating from a stale version. Disallow. Return, db version.
            return db_emoji
        }
    } else {
        // Create.
        var emoji = Emoji.from_create({
                id: o.id
              , slug_name: ''
              , display_name: o.display_name
              , tags: o.tags
              , scopes: o.scopes
              , created_by: o.session.account_id
            })
          , created_emojis = yield EmojiPersistenceService.insert(emoji)
          , created_emoji = created_emojis.first()

        return created_emoji
    }
}

EmojiLocalService.prototype.get_by_id = function * (o) {
    this.validate_id(o.id)

    var emojis = yield EmojiPersistenceService.select_by_id({id: o.id})
      , emoji = emojis.first()

    if (emoji) {
        if (emoji.deleted_at) {
            return null
        } else if (o.session.account_id === emoji.created_by) {
            return emoji
        } else if (emoji.scopes.indexOf('public_read') > -1) {
            return emoji
        } else {
            return null
        }
    } else {
        return null
    }
}

EmojiLocalService.prototype.get_by_created_by = function * (o) {
    this.validate_session(o.session)

    var emojis = yield EmojiPersistenceService.select_by_created_by__not_deleted({
        created_by: o.session.account_id
    })

    return emojis
}

EmojiLocalService.prototype.get_by_created_by__emoji_collection_id = function * (o) {
    this.validate_session(o.session)
    this.validate_emoji_collection_id(o.emoji_collection_id)

    var emojis = yield EmojiPersistenceService.select_by_created_by__emoji_collection_id__not_deleted({
        created_by: o.session.account_id
      , emoji_collection_id: o.emoji_collection_id
    })

    return emojis
}

EmojiLocalService.prototype.delete_by_id = function * (o) {
    this.validate_id(o.id)
    this.validate_session(o.session)

    var emojis = yield EmojiPersistenceService.select_by_id({id: o.id})
      , emoji = emojis.first()

    if (emoji) {
        if (emoji.deleted_at) {
            return emoji
        }

        // Cannot delete someone else's.
        if (emoji.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        emoji.deleted_at = 'now()'
        emoji.session = o.session

        return yield this._update(emoji)
    } else {
        return null
    }
}

module.exports = EmojiLocalService

var SessionLocalService = require('../../session/server/SessionLocalService').get_instance()
  , EmojiCollectionLocalService = require('../../emoji_collection/server/EmojiCollectionLocalService').get_instance()
