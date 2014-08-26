var _ = require('underscore')
  , Asset = require('./Asset')
  , CollectionMixin = require('src/common/CollectionMixin')

var Assets = function(o) {
    this.ns = 'Assets'
    for (var i = 0, ii = Assets.keys.length; i < ii; ++i) {
        var key = Assets.keys[i]
        this[key] = o[key]
    }
}
_.extend(Assets, CollectionMixin)
_.extend(Assets.prototype, CollectionMixin.prototype)

Assets.model = Asset

module.exports = Assets
