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

var EmojiCollectionLocalService = function EmojiCollectionLocalService() {
    this.ns = 'EmojiCollectionLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(EmojiCollectionLocalService, StaticMixin)

EmojiCollectionLocalService.prototype.get_by_id = function * (o) {
    if (!validator.isLength(o.id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'EmojiCollection ids contain more than 10 characters.', 400)
    }

    var emoji_collections = yield EmojiCollectionPersistenceService.select_by_id({id: o.id})

    return (emoji_collections && emoji_collections.list.length === 1) ? emoji_collections.list[0] : null
}

EmojiCollectionLocalService.prototype.create = function * (o) {
    var self = this

    o.tags = o.tags || []
    o.privacy = o.privacy || []
    // TODO: validation
    // If no session fail

    var emoji_collection = EmojiCollection.from_create({
            slug_name: ''
          , display_name: o.display_name
          , tags: o.tags
          , privacy: o.privacy
          , created_by: o.session.account_id
        })
      , created_emoji_collections = yield EmojiCollectionPersistenceService.insert(emoji_collection)
      , emoji_collection = (created_emoji_collections && created_emoji_collections.list.length === 1) ? created_emoji_collections.list[0] : null

    return emoji_collection
}

module.exports = EmojiCollectionLocalService

var SessionLocalService = require('../../session/server/SessionLocalService').get_instance()
