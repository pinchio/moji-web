var _ = require('underscore')
  , Events = require('./Events')
  , QueryMixin = require('src/common/server/QueryMixin')
  , StaticMixin = require('src/common/StaticMixin')

var EventPersistenceService = function EventPersistenceService() {
    this.ns = 'EventPersistenceService'
    this.columns = [
        'id'
      , 'created_at'
      , 'event'
      , 'label'
      , 'value'
      , 'event_group_id'
      , 'created_by'
    ]
    this.table = 'event'
    this.clazz = Events
}
_.extend(EventPersistenceService, StaticMixin)
_.extend(EventPersistenceService.prototype, QueryMixin.prototype)

module.exports = EventPersistenceService
