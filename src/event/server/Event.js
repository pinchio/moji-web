var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ModelMixin = require('src/common/ModelMixin')
  , Moment = require('moment')
  , uuid = require('node-uuid')

var Event = function(o) {
    var self = this

    this.ns = 'Event'
    Event.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(Event, ModelMixin)

Event.keys = [
    'id'
  , 'created_at'
  , 'event'
  , 'label'
  , 'value'
  , 'event_group_id'
  , 'created_by'
]

Event.from_create = function(o) {
    return new Event({
        id: uuid.v4()
      , created_at: 'now()'
      , event: o.event
      , label: o.label
      , value: o.value
      , event_group_id: o.event_group_id
      , created_by: o.created_by
    })
}

Event.from_db = function(o) {
    return new Event({
        id: o.id
      , created_at: Event.to_moment(o.created_at)
      , event: o.event
      , label: o.label
      , value: o.value
      , event_group_id: o.event_group_id
      , created_by: o.created_by
    })
}

Event.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: Event.from_moment(this.created_at)
      , event: this.event
      , label: this.label
      , value: this.value
      , event_group_id: this.event_group_id
      , created_by: this.created_by
    }
}

module.exports = Event
