var LocalServiceError = require('src/common/server/LocalServiceError')
  , path = require('path')

var ValidationMixin = function() {}

ValidationMixin.prototype.validate_session = function * (session) {
    if (!session) {
        return
    }

    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

ValidationMixin.prototype.validate_required = function * (field_name, field_value) {
    if (!field_value) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' is required.', 400)
    }
}

ValidationMixin.prototype.valid_asset_file_name_extensions = ['.png', '.jpg', '.jpeg', 'gif']
ValidationMixin.prototype.validate_asset_file_name = function * (file_name) {
    if (!file_name) {
        return
    }

    var ext = path.extname(file_name)

    if (this.valid_asset_file_name_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset extension not supported.', 400)
    }
}

ValidationMixin.prototype.validate_asset_url = function * (asset_url) {
    if (!asset_url) {
        return
    }

    var ext = path.extname(asset_url)

    if (this.valid_asset_file_name_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset extension not supported.', 400)
    }
}

module.exports = ValidationMixin
