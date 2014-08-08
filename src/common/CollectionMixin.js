var Moment = require('moment')

var CollectionMixin = function() {}

CollectionMixin.from_db = function(raw) {
    var results = []

    for (var i = 0, ii = raw.length; i < ii; ++i) {
        var o = raw[i]
          , result = this.model.from_db(o)

        results.push(result)
    }

    return new this({list: results})
}

CollectionMixin.prototype.first = function() {
    return (this.list.length === 1) ? this.list[0] : null
}

CollectionMixin.prototype.to_json = function() {
    var result = []

    for (var i = 0, ii = this.list.length; i < ii; ++i) {
        result.push(this.list[i].to_json())
    }

    return result
}

module.exports = CollectionMixin