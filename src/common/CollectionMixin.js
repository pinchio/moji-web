var CollectionMixin = function() {}

// FIXME: this is dangerous in that everyone shares this copy.
CollectionMixin.keys = ['list']

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

CollectionMixin.prototype.to_json = function * (o) {
    var result = []

    for (var i = 0, ii = this.list.length; i < ii; ++i) {
        result.push(yield this.list[i].to_json({session: o.session, expand: o.expand}))
    }

    return result
}

CollectionMixin.prototype.get_ids = function * () {
    var ids = []
    for (var i = 0, ii = this.list.length; i < ii; ++i) {
        ids.push(this.list[i].id)
    }

    return ids
}

module.exports = CollectionMixin
