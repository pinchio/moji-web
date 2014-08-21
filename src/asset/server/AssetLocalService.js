var _ = require('underscore')
  , LocalServiceError = require('src/common').LocalServiceError
  , AssetPersistenceService = require('./AssetPersistenceService').get_instance()
  , StaticMixin = require('../../common/StaticMixin')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , thunkify = require('thunkify')
  , Asset = require('./Asset')
  , fs = require('fs')
  , readFile_thunk = thunkify(fs.readFile)
  , AWS = require('aws-sdk')
  , config = require('../../../config')
  , path = require('path')
  , crypto = require('crypto')
  , ValidationMixin = require('src/common').ValidationMixin

// FIXME: this endpoint is vulnerable to DDOS. Should rate limit uploads by session. 429
var AssetLocalService = function AssetLocalService() {
    this.ns = 'AssetLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(AssetLocalService, StaticMixin)
_.extend(AssetLocalService.prototype, ValidationMixin.prototype)

AssetLocalService.prototype.get_file_sha = function(file_data) {
    return crypto.createHash('sha1').update(file_data).digest('hex')
}

AssetLocalService.prototype.create = function * (o) {
    yield this.validate_session(o.session)
    yield this.validate_asset_file_name(o.original_file_name, 'Original file name')

    // TODO: Errors from s3?
    // TODO: Optimization: check for duplicates before uploading to S3.
    var file_data = yield readFile_thunk(o.local_file_name)
      , original_file_name_ext = path.extname(o.original_file_name)
      , s3_file_name = this.get_file_sha(file_data) + original_file_name_ext
      , put_response = yield this.s3_bucket_put_object({
            Key: s3_file_name
          , Body: file_data
        })
      , asset = Asset.from_create({
            created_by: o.session.account_id
          , asset_url: this.s3_base_url + s3_file_name
        })

    try {
        var inserted_asset = (yield AssetPersistenceService.insert(asset)).first()
    } catch (e) {
        if (e && e.type === 'db_duplicate_key_error' && e.detail && e.detail.key === 'asset_url') {
            // Asset already exists in db. Nothing to do.
            return asset
        } else {
            throw e
        }
    }

    return inserted_asset
}

module.exports = AssetLocalService
