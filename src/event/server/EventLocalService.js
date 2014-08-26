var _ = require('underscore')
  , Event = require('./Event')
  , EventPersistenceService = require('./EventPersistenceService').get_instance()
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , StaticMixin = require('src/common/StaticMixin')
  , uuid = require('node-uuid')
  , ValidationMixin = require('src/common/server/ValidationMixin')

var EventLocalService = function EventLocalService() {
    this.ns = 'EventLocalService'
}
_.extend(EventLocalService, StaticMixin)
_.extend(EventLocalService.prototype, ValidationMixin.prototype)

EventLocalService.prototype.create = function * (o) {
    o.properties = o.properties || {}

    yield this.validate_session(o.session)
    yield this.validate_event(o.event)
    yield this.validate_json_object(o.properties, 'Properties')

    var properties_keys = Object.keys(o.properties)

    yield this.validate_number(properties_keys.length, 0, 10, 'Number of properties')

    var event_group_id = uuid.v4()
      , created_by = o.session.account_id
      , events = [Event.from_create({
            event: o.event
          , event_group_id: event_group_id
          , created_by: created_by
        })]

    for (var i = 0, ii = properties_keys.length; i < ii; ++i) {
        var label = properties_keys[i]
          , value = o.properties[label]

        events.push(Event.from_create({
            event: o.event
          , label: label
          , value: value
          , event_group_id: event_group_id
          , created_by: created_by
        }))
    }

    var inserted_events = yield EventPersistenceService.insert(events)

    if (o.event === 'emoji_send') {
    } else if (o.event === 'emoji_saved') {
    }

    return
}

module.exports = EventLocalService

var EmojiLocalService = require('src/emoji/server/EmojiLocalService').get_instance()
  , EmojiCollectionLocalService = require('src/emoji_collection/server/EmojiCollectionLocalService').get_instance()
