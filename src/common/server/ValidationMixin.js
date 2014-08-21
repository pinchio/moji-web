var LocalServiceError = require('src/common/server/LocalServiceError')
  , path = require('path')

var ValidationMixin = function() {}

ValidationMixin.prototype.validate_session = function * (session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

ValidationMixin.prototype.valid_asset_file_name_extensions = ['.png', '.jpg', '.jpeg', 'gif']
ValidationMixin.prototype.validate_asset_file_name = function * (file_name) {
    if (!file_name) {
        throw new LocalServiceError(this.ns, 'bad_request', 'File name is required.', 400)
    }

    var ext = path.extname(file_name)

    if (this.valid_asset_file_name_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Asset extension not supported.', 400)
    }
}

module.exports = ValidationMixin
