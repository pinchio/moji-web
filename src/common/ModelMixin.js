var Moment = require('moment')

var ModelMixin = function() {}

ModelMixin.from_moment = function(value) {
    return Moment.isMoment(value) ? value.toISOString() : value
}

ModelMixin.to_moment = function(value) {
    if (value !== null) {
        var maybe_moment = new Moment(value)
        if (maybe_moment.isValid()) {
            return maybe_moment
        } else {
            return value
        }
    } else {
        return value
    }
}

ModelMixin.text_to_json = function(value) {
    if (value !== null) {
        try {
            var maybe_json = JSON.parse(value)
            return maybe_json
        } catch(e) {
            console.log('error parsing from text to json: ' + value)
            return null
        }
    } else {
        return value
    }
}

ModelMixin.json_to_text = function(value) {
    if (value !== null) {
        try {
            var maybe_text = JSON.stringify(value)
            return maybe_text
        } catch(e) {
            console.log('error parsing from json to text: ' + value)
            return null
        }
    } else {
        return value
    }
}

module.exports = ModelMixin
