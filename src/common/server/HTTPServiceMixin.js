var HTTPServiceMixin = function() {}

HTTPServiceMixin.prototype.handle_success = function(that, data, format) {
    if (data) {
        that.body = data

        if (format && format === 'json') {
            that.type = 'application/json; charset=utf-8'
        }
    } else {
        that.status = 404
    }

    console.log('handle_success: ', that.status, that.body)
}

HTTPServiceMixin.prototype.handle_exception = function(that, error) {
    if (error && error.to_client && error.status_code !== 500) {
        that.body = error.to_client()
        that.status = error.status_code
    } else {
        that.body = {
            type: 'internal_server_error'
          , description: 'An internal error has occurred. Please try again.'
        }
        that.status = 500
    }

    console.error('handle_exception: ', that.body, that.status)
    console.error(error)
    console.error(error && error.stack)
}

HTTPServiceMixin.prototype.handle_not_found = function(that) {
    that.body = {
        type: 'not_found'
      , description: 'Not found.'
    }
    that.status = 404
}

module.exports = HTTPServiceMixin
