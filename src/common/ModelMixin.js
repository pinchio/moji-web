var Moment = require('moment')

var ModelMixin = function() {}

ModelMixin.from_moment = function(value) {
    return Moment.isMoment(value) ? value.toISOString() : value
}

ModelMixin.to_moment = function(value) {
    // TODO: hack-ish
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

module.exports = ModelMixin
