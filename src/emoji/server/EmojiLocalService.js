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

EmojiLocalService.prototype.get_file_sha = function(file_data) {
    return crypto.createHash('sha1').update(file_data).digest('hex')
}

EmojiLocalService.prototype.get_by_id = function * (o) {
    if (!validator.isLength(o.id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Emoji ids contain more than 10 characters.', 400)
    }

    var emojis = yield EmojiPersistenceService.select_by_id({id: o.id})

    return (emojis && emojis.list.length === 1) ? emojis.list[0] : null
}

EmojiLocalService.prototype.create = function * (o) {
    var self = this

    o.tags = o.tags || []
    o.scopes = o.scopes || []
    // TODO: validation
    // If no session fail

    var file_data = yield readFile_thunk(o.tmp_file_name)
      , original_file_name_ext = path.extname(o.original_file_name)
      , s3_file_name = self.get_file_sha(file_data) + original_file_name_ext
      , put_response = yield this.s3_bucket_put_object({
            Key: s3_file_name
          , Body: file_data
        })

    var emoji = Emoji.from_create({
            slug_name: o.slug_name
          , display_name: o.display_name
          , image_url: this.s3_base_url + s3_file_name
          , tags: o.tags
          , scopes: o.scopes
          , created_by: o.session.account_id
        })
      , created_emojis = yield EmojiPersistenceService.insert(emoji)
      , emoji = (created_emojis && created_emojis.list.length === 1) ? created_emojis.list[0] : null

    return emoji
}

module.exports = EmojiLocalService

var SessionLocalService = require('../../session/server/SessionLocalService').get_instance()
