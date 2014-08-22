var LocalServiceError = require('src/common/server/LocalServiceError')
  , path = require('path')
  , validator = require('validator')
  , thunkify = require('thunkify')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})

var ValidationMixin = function() {}

ValidationMixin.prototype.validate_session = function * (session) {
    if (!session.account_id) {
        throw new LocalServiceError(this.ns, 'unauthorized', 'Authentication required.', 401)
    }
}

ValidationMixin.prototype.validate_uuid = function * (id, field_name) {
    if (!validator.isLength(id, 10)) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' must contain more than 10 characters.', 400)
    }
}

ValidationMixin.prototype.valid_asset_file_name_extensions = ['.png', '.jpg', '.jpeg', '.gif']
ValidationMixin.prototype.validate_asset_file_name = function * (file_name, field_name) {
    var ext = path.extname(file_name)

    if (this.valid_asset_file_name_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' extension not supported.', 400)
    }
}

ValidationMixin.prototype.validate_asset_url = function * (asset_url, field_name) {
    var ext = path.extname(asset_url)

    if (this.valid_asset_file_name_extensions.indexOf(ext) === -1) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' extension not supported.', 400)
    }
}

ValidationMixin.prototype.validate_username = function * (username) {
    if (!validator.isLength(username, 3, 15)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Username must be between 3 and 15 characters.', 400)
    }

    if (!validator.isAlphanumeric(username)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Username can only contain letters and numbers.', 400)
    }
}

ValidationMixin.prototype.validate_password = function * (password) {
    if (!validator.isLength(password, 6, 50)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Password must be between 6 and 50 characters.', 400)
    }

    if (!validator.isAlphanumeric(password)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Password can only contain letters and numbers.', 400)
    }
}

ValidationMixin.prototype.validate_email = function * (email) {
    if (!validator.isEmail(email)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Email is not valid.', 400)
    }
}

ValidationMixin.prototype.validate_password_hash_salt = thunkify(function(password, expected_password, cb) {
    var hash_salt = expected_password.split(':')

    easy_pbkdf2.verify(hash_salt[1], hash_salt[0], password, function(err, valid) {
        return cb(err, valid)
    })
})

ValidationMixin.prototype.validate_can_edit = function * (created_by, session_account_id) {
    if (created_by !== session_account_id) {
        throw new LocalServiceError(this.ns, 'forbidden', 'Forbidden.', 403)
    }
}

ValidationMixin.prototype.validate_exists = function * (field_value) {
    if (field_value === null || field_value === void 0) {
        throw new LocalServiceError(this.ns, 'not_found', 'Not found.', 404)
    }
}

ValidationMixin.prototype.validate_query = function * (query) {
    if (!validator.isLength(query, 2)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Queries must be at least 2 characters.', 400)
    }
}

module.exports = ValidationMixin
