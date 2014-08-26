var _ = require('underscore')
  , AWS = require('aws-sdk')
  , config = require('../../../config')
  , crypto = require('crypto')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , Emoji = require('./Emoji')
  , EmojiPersistenceService = require('./EmojiPersistenceService').get_instance()
  , fs = require('fs')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , path = require('path')
  , StaticMixin = require('src/common/StaticMixin')
  , thunkify = require('thunkify')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var readFile_thunk = thunkify(fs.readFile)

var EmojiLocalService = function EmojiLocalService() {
    this.ns = 'EmojiLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(EmojiLocalService, StaticMixin)
_.extend(EmojiLocalService.prototype, ValidationMixin.prototype)

EmojiLocalService.prototype.get_file_sha = function(file_data) {
    return crypto.createHash('sha1').update(file_data).digest('hex')
}

EmojiLocalService.prototype.create = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)
    o.extra_data = o.extra_data || {}

    yield this.validate_session(o.session)
    yield this.validate_display_name(o.display_name)
    yield this.validate_tags(o.tags)
    yield this.validate_scopes(o.scopes)
    yield this.validate_asset_file_name(o.original_file_name, 'Asset')
    yield this.validate_uuid(o.emoji_collection_id, 'Emoji collection ids')

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
      , file_sha = this.get_file_sha(file_data)
      , s3_file_name = file_sha + original_file_name_ext
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
          , asset_hash: file_sha
          , emoji_collection_id: o.emoji_collection_id
          , extra_data: o.extra_data
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
          , asset_url: o.asset_url
          , asset_hash: o.asset_hash
          , emoji_collection_id: o.emoji_collection_id
          , extra_data: o.extra_data
        })
      , updated_emojis = yield EmojiPersistenceService.update_by_id(emoji)
      , updated_emoji = updated_emojis.first()

      return updated_emoji
}

EmojiLocalService.prototype.upsert = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)
    o.extra_data = o.extra_data || {}

    yield this.validate_session(o.session)
    yield this.validate_uuid(o.id, 'Emoji ids')
    yield this.validate_display_name(o.display_name)
    yield this.validate_tags(o.tags)
    yield this.validate_scopes(o.scopes)
    yield this.validate_uuid(o.created_by, 'Emoji collection created by ids')
    yield this.validate_asset_file_name(o.original_file_name, 'Asset')
    yield this.validate_uuid(o.emoji_collection_id, 'Emoji collection ids')

    if (o.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
    }

    // Make sure emoji collection exists.
    var emoji_collection = yield EmojiCollectionLocalService.get_by_id({
            id: o.emoji_collection_id
          , session: o.session
        })

    if (!emoji_collection) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Invalid emoji collection id.', 400)
    }

    if (emoji_collection.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Not authorized to update emoji in this collection.', 403)
    }

    // Make sure emoji exists.
    var db_emoji = (yield EmojiPersistenceService.select_by_id({id: o.id})).first()

    if (db_emoji) {
        // Update.
        if (db_emoji.deleted_at) {
            throw new LocalServiceError(this.ns, 'conflict', 'Cannot update deleted emoji.', 409)
        }

        if (db_emoji.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        if (db_emoji.emoji_collection_id !== o.emoji_collection_id) {
            throw new LocalServiceError(this.ns, 'not_authoried', 'Cannot modify emoji collection id.', 403)
        }

        if (db_emoji.updated_at.isSame(o.updated_at)) {
            var file_data = yield readFile_thunk(o.local_file_name)
              , original_file_name_ext = path.extname(o.original_file_name)
              , file_sha = this.get_file_sha(file_data)
              , s3_file_name = file_sha + original_file_name_ext
              , put_response = yield this.s3_bucket_put_object({
                    Key: s3_file_name
                  , Body: file_data
                })

            o.created_at = db_emoji.created_at
            o.asset_url = this.s3_base_url + s3_file_name
            o.asset_hash = file_sha
            o.sent_count = db_emoji.sent_count
            o.saved_count = db_emoji.saved_count

            return yield this._update(o)
        } else {
            // Updating from a stale version. Disallow. Return, db version.
            return db_emoji
        }
    } else {
        // Create.
        var file_data = yield readFile_thunk(o.local_file_name)
          , original_file_name_ext = path.extname(o.original_file_name)
          , file_sha = this.get_file_sha(file_data)
          , s3_file_name = file_sha + original_file_name_ext
          , put_response = yield this.s3_bucket_put_object({
                Key: s3_file_name
              , Body: file_data
            })

        var emoji = Emoji.from_create({
                id: o.id
              , slug_name: o.slug_name
              , display_name: o.display_name
              , tags: o.tags
              , scopes: o.scopes
              , created_by: o.session.account_id
              , asset_url: this.s3_base_url + s3_file_name
              , asset_hash: file_sha
              , emoji_collection_id: o.emoji_collection_id
              , extra_data: o.extra_data
            })
          , created_emojis = yield EmojiPersistenceService.insert(emoji)
          , emoji = created_emojis.first()

        return emoji
    }
}

EmojiLocalService.prototype.get_by_id = function * (o) {
    yield this.validate_uuid(o.id, 'Emoji ids')

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
    yield this.validate_session(o.session)

    var emojis = yield EmojiPersistenceService.select_by_created_by__not_deleted({
        created_by: o.session.account_id
    })

    return emojis
}

EmojiLocalService.prototype.get_by_emoji_collection_id__scopes = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.emoji_collection_id, 'Emoji collection ids')
    yield this.validate_scopes(o.scopes)

    var emojis = yield EmojiPersistenceService.select_by_created_by__emoji_collection_id__scopes__not_deleted({
        created_by: o.session.account_id
      , emoji_collection_id: o.emoji_collection_id
      , scopes: o.scopes
    })

    return emojis
}

EmojiLocalService.prototype.get_by_query__created_by = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_query(o.query)

    var query = o.query.replace(/\s/g, '&')
      , emojis = yield EmojiPersistenceService.select_by_query__created_by({
            query: o.query
          , created_by: o.created_by
        })

    return emojis
}

EmojiLocalService.prototype.delete_by_id = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.id, 'Emoji ids')

    var emoji = (yield EmojiPersistenceService.select_by_id({id: o.id})).first()

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

var SessionLocalService = require('src/session/server/SessionLocalService').get_instance()
  , EmojiCollectionLocalService = require('src/emoji_collection/server/EmojiCollectionLocalService').get_instance()
