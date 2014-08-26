var _ = require('underscore')
  , CollectionMixin = require('src/common/CollectionMixin')
  , Event = require('./Event')

var Events = function(o) {
    this.ns = 'Events'
    for (var i = 0, ii = Events.keys.length; i < ii; ++i) {
        var key = Events.keys[i]
        this[key] = o[key]
    }
}
_.extend(Events, CollectionMixin)
_.extend(Events.prototype, CollectionMixin.prototype)

Events.model = Event

module.exports = Events
