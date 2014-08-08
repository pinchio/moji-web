var _ = require('underscore')
  , Emoji = require('./Emoji')
  , CollectionMixin = require('../../common/CollectionMixin')

var Emojis = function(o) {
    var self = this

    this.ns = 'Emojis'
    Emojis.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
Emojis.keys = ['list']
Emojis.model = Emoji
_.extend(Emojis, CollectionMixin)
_.extend(Emojis.prototype, CollectionMixin.prototype)

module.exports = Emojis
