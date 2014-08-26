var _ = require('underscore')
  , easy_pbkdf2 = require('easy-pbkdf2')({DEFAULT_HASH_ITERATIONS: 10000, SALT_SIZE: 32, KEY_LENGTH: 256})
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , path = require('path')
  , thunkify = require('thunkify')
  , validator = require('validator')

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
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' file name extension not supported.', 400)
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

// ValidationMixin.prototype.valid_display_name_regex = /^[A-Za-z0-9\s\-_,\.;:()]*$/
ValidationMixin.prototype.valid_display_name_regex = /.*/
ValidationMixin.prototype.validate_display_name = function * (display_name) {
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

ValidationMixin.prototype.validate_tags = function * (tags) {
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

ValidationMixin.prototype.valid_scopes = ['public_read']
ValidationMixin.prototype.validate_scopes = function * (scopes) {
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

ValidationMixin.prototype.validate_extra_data = function * (extra_data) {
    var keys = Object.keys(extra_data)

    for (var i = 0, ii = keys.length; i < ii; ++i) {
        var key = keys[i]
        if (this.valid_extra_data_keys.indexOf(key) === -1) {
            throw new LocalServiceError(this.ns, 'bad_request', 'Extra_data ' + key + ' is not allowed.', 400)
        }

        if (!_.isString(extra_data[key])) {
            throw new LocalServiceError(this.ns, 'bad_request', key + ' contains an invalid value.', 400)
        }
    }
}

ValidationMixin.prototype.valid_event_regex = /^[A-Za-z0-9_]*$/
ValidationMixin.prototype.validate_event = function * (event) {
    if (!validator.isLength(event, 2, 512)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Event must be between 2 and 512 characters.', 400)
    }

    if (!validator.matches(event, this.valid_event_regex)) {
        throw new LocalServiceError(this.ns, 'bad_request', 'Event can only contain letters, numbers and underscores.', 400)
    }
}

ValidationMixin.prototype.validate_number = function * (number, min, max, field_name) {
    if (!_.isNumber(number)) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' should be a number.', 400)
    }

    if (!(min <= number && number <= max)) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' should be between ' + min + ' and ' + max + '.', 400)
    }
}

ValidationMixin.prototype.validate_json_object = function * (value, field_name) {
    if (!_.isObject(value) || _.isArray(value)) {
        throw new LocalServiceError(this.ns, 'bad_request', field_name + ' should be a JSON object like {}.', 400)
    }
}

module.exports = ValidationMixin
