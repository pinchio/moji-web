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

    console.log('handle_success: ', that.status, JSON.stringify(that.body, 4, 4))
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

// Send in ancestor_emoji_id,ancestor_emoji_id_expanded.created_by
HTTPServiceMixin.prototype.parse_expand = function(expand) {
    if (!expand) {
        return {}
    }

    var params = expand.split(',')
      , result = {}
    // [emoji.ancestor_emoji_id, emoji.ancestor_emoji_id_expanded.created_by]

    for (var i = 0, ii = params.length; i < ii; ++i) {
        var param = params[i]
          , nested_params = param.split('.')
          , previous = result

        for (var j = 0, jj = nested_params.length; j < jj; ++j) {
            var nested_param = nested_params[j]

            previous[nested_param] = previous[nested_param] || {}
            previous = previous[nested_param]
        }
    }

    return result
}

module.exports = HTTPServiceMixin
