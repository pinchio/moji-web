var _ = require('underscore')
  , validator = require('validator')
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

var AssetLocalService = function AssetLocalService() {
    this.ns = 'AssetLocalService'
    this.s3_bucket = new AWS.S3({params: {Bucket: config.get('s3').bucket}})
    this.s3_bucket_put_object = thunkify(this.s3_bucket.putObject).bind(this.s3_bucket)
    this.s3_base_url = this.s3_bucket.endpoint.href + config.get('s3').bucket + '/'
}
_.extend(AssetLocalService, StaticMixin)

AssetLocalService.prototype.validate_session = function(session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

// AssetLocalService.prototype.valid_display_name_regex = /^[A-Za-z0-9\s\-_,\.;:()]*$/
AssetLocalService.prototype.valid_display_name_regex = /.*/

AssetLocalService.prototype.validate_display_name = function(display_name) {
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

AssetLocalService.prototype.validate_tags = function(tags) {
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

AssetLocalService.prototype.valid_scopes = ['public_read']

AssetLocalService.prototype.validate_scopes = function(scopes) {
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

AssetLocalService.prototype.validate_id = function(id) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset ids contain more than 10 characters.', 400)
    }
}

AssetLocalService.prototype.validate_image_collection_id = function(image_collection_id) {
    if (!validator.isLength(image_collection_id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset collection ids contain more than 10 characters.', 400)
    }
}

AssetLocalService.prototype.validate_created_by = function(id) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset collection created by ids contain more than 10 characters.', 400)
    }
}

AssetLocalService.prototype.valid_file_extensions = ['.png', '.jpg', '.jpeg', 'gif']
AssetLocalService.prototype.validate_file_name = function(file_name) {
    if (!file_name) {
        throw new LocalServiceError(this.ns, 'bad_request', 'File name is required.', 400)
    }

    var ext = path.extname(file_name)

    if (this.valid_file_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset extension not supported.', 400)
    }
}

AssetLocalService.prototype.validate_query = function(query) {
    if (!validator.isLength(query, 2)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Queries must be at least 2 characters.', 400)
    }
}

AssetLocalService.prototype.get_file_sha = function(file_data) {
    return crypto.createHash('sha1').update(file_data).digest('hex')
}

AssetLocalService.prototype.create = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)
    o.extra_data = o.extra_data || {}

    this.validate_session(o.session)
    this.validate_display_name(o.display_name)
    this.validate_tags(o.tags)
    this.validate_scopes(o.scopes)
    this.validate_file_name(o.original_file_name)
    this.validate_image_collection_id(o.image_collection_id)

    // Make sure image collection exists.
    var image_collection = yield EmojiCollectionLocalService.get_by_id({
            id: o.image_collection_id
          , session: o.session
        })

    if (!image_collection) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Invalid image collection id.', 400)
    }

    if (image_collection.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Not authorized to create image in this collection.', 403)
    }

    var file_data = yield readFile_thunk(o.local_file_name)
      , original_file_name_ext = path.extname(o.original_file_name)
      , s3_file_name = this.get_file_sha(file_data) + original_file_name_ext
      , put_response = yield this.s3_bucket_put_object({
            Key: s3_file_name
          , Body: file_data
        })

    var image = Asset.from_create({
            slug_name: o.slug_name
          , display_name: o.display_name
          , tags: o.tags
          , scopes: o.scopes
          , created_by: o.session.account_id
          , asset_url: this.s3_base_url + s3_file_name
          , image_collection_id: o.image_collection_id
          , extra_data: o.extra_data
        })
      , created_images = yield AssetPersistenceService.insert(image)
      , image = created_images.first()

    return image
}

AssetLocalService.prototype._update = function * (o) {
    var image = Asset.from_update({
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
          , image_collection_id: o.image_collection_id
          , extra_data: o.extra_data
        })
      , updated_images = yield AssetPersistenceService.update_by_id(image)
      , updated_image = updated_images.first()

      return updated_image
}

AssetLocalService.prototype.upsert = function * (o) {
    o.display_name = o.display_name || ''
    o.tags = o.tags || []
    o.scopes = o.scopes || []
    o.scopes = _.unique(o.scopes)
    o.extra_data = o.extra_data || {}

    this.validate_session(o.session)
    this.validate_id(o.id)
    this.validate_display_name(o.display_name)
    this.validate_tags(o.tags)
    this.validate_scopes(o.scopes)
    this.validate_created_by(o.created_by)
    this.validate_file_name(o.original_file_name)
    this.validate_image_collection_id(o.image_collection_id)

    if (o.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
    }

    // Make sure image collection exists.
    var image_collection = yield EmojiCollectionLocalService.get_by_id({
            id: o.image_collection_id
          , session: o.session
        })

    if (!image_collection) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Invalid image collection id.', 400)
    }

    if (image_collection.created_by !== o.session.account_id) {
        throw new LocalServiceError(this.ns, 'access_denied', 'Not authorized to update image in this collection.', 403)
    }

    // Make sure image exists.
    var db_images = yield AssetPersistenceService.select_by_id({id: o.id})
      , db_image = db_images.first()

    if (db_image) {
        // Update.
        if (db_image.deleted_at) {
            throw new LocalServiceError(this.ns, 'conflict', 'Cannot update deleted image.', 409)
        }

        if (db_image.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        if (db_image.image_collection_id !== o.image_collection_id) {
            throw new LocalServiceError(this.ns, 'not_authoried', 'Cannot modify image collection id.', 403)
        }

        if (db_image.updated_at.isSame(o.updated_at)) {
            var file_data = yield readFile_thunk(o.local_file_name)
              , original_file_name_ext = path.extname(o.original_file_name)
              , s3_file_name = this.get_file_sha(file_data) + original_file_name_ext
              , put_response = yield this.s3_bucket_put_object({
                    Key: s3_file_name
                  , Body: file_data
                })

            o.created_at = db_image.created_at
            o.asset_url = this.s3_base_url + s3_file_name
            return yield this._update(o)
        } else {
            // Updating from a stale version. Disallow. Return, db version.
            return db_image
        }
    } else {
        // Create.
        var file_data = yield readFile_thunk(o.local_file_name)
          , original_file_name_ext = path.extname(o.original_file_name)
          , s3_file_name = this.get_file_sha(file_data) + original_file_name_ext
          , put_response = yield this.s3_bucket_put_object({
                Key: s3_file_name
              , Body: file_data
            })

        var image = Asset.from_create({
                id: o.id
              , slug_name: o.slug_name
              , display_name: o.display_name
              , tags: o.tags
              , scopes: o.scopes
              , created_by: o.session.account_id
              , asset_url: this.s3_base_url + s3_file_name
              , image_collection_id: o.image_collection_id
              , extra_data: o.extra_data
            })
          , created_images = yield AssetPersistenceService.insert(image)
          , image = created_images.first()

        return image
    }
}

AssetLocalService.prototype.get_by_id = function * (o) {
    this.validate_id(o.id)

    var images = yield AssetPersistenceService.select_by_id({id: o.id})
      , image = images.first()

    if (image) {
        if (image.deleted_at) {
            return null
        } else if (o.session.account_id === image.created_by) {
            return image
        } else if (image.scopes.indexOf('public_read') > -1) {
            return image
        } else {
            return null
        }
    } else {
        return null
    }
}

AssetLocalService.prototype.get_by_created_by = function * (o) {
    this.validate_session(o.session)

    var images = yield AssetPersistenceService.select_by_created_by__not_deleted({
        created_by: o.session.account_id
    })

    return images
}

AssetLocalService.prototype.get_by_image_collection_id__scopes = function * (o) {
    this.validate_session(o.session)
    this.validate_image_collection_id(o.image_collection_id)
    this.validate_scopes(o.scopes)

    var images = yield AssetPersistenceService.select_by_created_by__image_collection_id__scopes__not_deleted({
        created_by: o.session.account_id
      , image_collection_id: o.image_collection_id
      , scopes: o.scopes
    })

    return images
}

AssetLocalService.prototype.get_by_query__created_by = function * (o) {
    this.validate_session(o.session)
    this.validate_query(o.query)

    var query = o.query.replace(/\s/g, '&')
      , images = yield AssetPersistenceService.select_by_query__created_by__not_deleted({
            query: o.query
          , created_by: o.created_by
        })

    return images
}

AssetLocalService.prototype.delete_by_id = function * (o) {
    this.validate_id(o.id)
    this.validate_session(o.session)

    var images = yield AssetPersistenceService.select_by_id({id: o.id})
      , image = images.first()

    if (image) {
        if (image.deleted_at) {
            return image
        }

        // Cannot delete someone else's.
        if (image.created_by !== o.session.account_id) {
            throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
        }

        image.deleted_at = 'now()'
        image.session = o.session

        return yield this._update(image)
    } else {
        return null
    }
}

module.exports = AssetLocalService

var SessionLocalService = require('../../session/server/SessionLocalService').get_instance()
  , EmojiCollectionLocalService = require('../../emoji_collection/server/EmojiCollectionLocalService').get_instance()
