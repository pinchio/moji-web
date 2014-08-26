var _ = require('underscore')
  , AWS = require('aws-sdk')
  , config = require('../../../config')
  , crypto = require('crypto')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , EmojiCollection = require('./EmojiCollection')
  , EmojiCollectionPersistenceService = require('./EmojiCollectionPersistenceService').get_instance()
  , fs = require('fs')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , Moment = require('moment')
  , path = require('path')
  , StaticMixin = require('src/common/StaticMixin')
  , thunkify = require('thunkify')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var readFile_thunk = thunkify(fs.readFile)

var EmojiCollectionLocalService = function EmojiCollectionLocalService() {
    this.ns = 'EmojiCollectionLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(EmojiCollectionLocalService, StaticMixin)
_.extend(EmojiCollectionLocalService.prototype, ValidationMixin.prototype)

EmojiCollectionLocalService.prototype.valid_extra_data_keys = ['background_color_light', 'background_color_dark']

EmojiCollectionLocalService.prototype.create = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)
    o.extra_data = o.extra_data || {}

    yield this.validate_session(o.session)
    yield this.validate_display_name(o.display_name)
    yield this.validate_tags(o.tags)
    yield this.validate_scopes(o.scopes)
    yield this.validate_extra_data(o.extra_data)

    var emoji_collection = EmojiCollection.from_create({
            slug_name: ''
          , display_name: o.display_name
          , tags: o.tags
          , scopes: o.scopes
          , created_by: o.session.account_id
          , extra_data: o.extra_data
        })
      , created_emoji_collections = yield EmojiCollectionPersistenceService.insert(emoji_collection)
      , emoji_collection = created_emoji_collections.first()

    return emoji_collection
}

EmojiCollectionLocalService.prototype._update = function * (o) {
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
          , extra_data: o.extra_data
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
    o.extra_data = o.extra_data || {}

    yield this.validate_session(o.session)
    yield this.validate_uuid(o.id, 'Emoji collection ids')
    yield this.validate_display_name(o.display_name)
    yield this.validate_tags(o.tags)
    yield this.validate_scopes(o.scopes)
    yield this.validate_uuid(o.created_by, 'Emoji collection created by ids')
    yield this.validate_extra_data(o.extra_data)

    if (o.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
    }

    var db_emoji_collection = (yield EmojiCollectionPersistenceService.select_by_id({id: o.id})).first()

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
              , extra_data: o.extra_data
            })
          , created_emoji_collections = yield EmojiCollectionPersistenceService.insert(emoji_collection)
          , created_emoji_collection = created_emoji_collections.first()

        return created_emoji_collection
    }
}

EmojiCollectionLocalService.prototype.get_by_id = function * (o) {
    yield this.validate_uuid(o.id, 'Emoji collection ids')

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

EmojiCollectionLocalService.prototype.get_by_created_by__scopes = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.created_by, 'Emoji collection created by ids')
    yield this.validate_scopes(o.scopes)

    if (o.session.account_id !== o.created_by) {
        var emoji_collections = yield EmojiCollectionPersistenceService.select_by_created_by__scopes__not_deleted({
            created_by: o.created_by
          , scopes: o.scopes
        })
    } else {
        var emoji_collections = yield EmojiCollectionPersistenceService.select_by_created_by__not_deleted({
            created_by: o.created_by
        })
    }

    return emoji_collections
}

EmojiCollectionLocalService.prototype.get_by_query__created_by = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_query(o.query)

    var query = o.query.replace(/\s/g, '&')
      , emojis = yield EmojiCollectionPersistenceService.select_by_query__created_by__not_deleted({
            query: o.query
          , created_by: o.created_by
        })

    return emojis
}

EmojiCollectionLocalService.prototype.delete_by_id = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_uuid(o.id, 'Emoji collection ids')

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
