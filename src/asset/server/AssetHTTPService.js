var _ = require('underscore')
  , AssetLocalService = require('./AssetLocalService').get_instance()
  , HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , StaticMixin = require('src/common/StaticMixin')
  , co_busboy = require('co-busboy')
  , fs = require('fs')
  , uuid = require('node-uuid')
  , co = require('co')
  , thunkify = require('thunkify')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var AssetHTTPService = function AssetHTTPService() {
    this.ns = 'AssetHTTPService'
}
_.extend(AssetHTTPService, StaticMixin)
_.extend(AssetHTTPService.prototype, HTTPServiceMixin.prototype)
_.extend(AssetHTTPService.prototype, ValidationMixin.prototype)

AssetHTTPService.prototype.part_stream_finish = thunkify(function(part, stream, cb) {
    stream.on('finish', cb)
    part.pipe(stream)
})

AssetHTTPService.prototype.post = function() {
    var self = this

    // TODO: If entry already exists in db for this asset_url, we dont need to upload it.
    // TODO: That would mean client must send up the hash.
    return function * (next) {
        try {
            yield self.validate_session(this.session)

            var parts = co_busboy(this)
              , part
              , body = {}
              , asset_part

            while (part = yield parts) {
                if (part.length) {
                    // If array field.
                    // Comes in like tags[] = 'foo', tags[] == 'bar'.
                    if (part[0].indexOf('[]') === part[0].length - 2) {
                        var key = part[0].substring(0, part[0].length - 2)
                        body[key] = body[key] || []
                        body[key].push(part[1])
                    } else {
                        body[part[0]] = part[1]
                    }
                } else if (part.fieldname === 'asset') {
                    asset_part = part
                    var local_file_name = '/tmp/' + uuid.v4()
                      , stream = fs.createWriteStream(local_file_name)
                      , original_file_name = asset_part.filename
                      , stream_finished = yield self.part_stream_finish(asset_part, stream)

                } else {
                    throw new LocalServiceError(this.ns, 'bad_request', part.fieldname + ' is not a valid field.', 400)
                }
            }

            if (!asset_part) {
                throw new LocalServiceError(this.ns, 'bad_request', 'Assets must include an asset.', 400)
            }

            var asset = yield AssetLocalService.create({
                    local_file_name: local_file_name
                  , original_file_name: original_file_name
                  , session: this.session
                })

            return self.handle_success(this, {asset: asset.to_privileged()}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = AssetHTTPService
