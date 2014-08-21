var _ = require('underscore')
  , Asset = require('./Asset')
  , CollectionMixin = require('../../common/CollectionMixin')

var Assets = function(o) {
    this.ns = 'Assets'
    for (var i = 0, ii = Assets.keys.length; i < ii; ++i) {
        var key = Assets.keys[i]
        this[key] = o[key]
    }
}
Assets.keys = ['list']
Assets.model = Asset
_.extend(Assets, CollectionMixin)
_.extend(Assets.prototype, CollectionMixin.prototype)

module.exports = Assets
