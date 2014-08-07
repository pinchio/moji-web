var _ = require('underscore')
  , QueryMixin = require('src/common').QueryMixin
  , EmojiCollections = require('./EmojiCollections')
  , StaticMixin = require('../../common/StaticMixin')

var EmojiCollectionPersistenceService = function EmojiCollectionPersistenceService() {
    this.ns = 'EmojiCollectionPersistenceService'
    this.columns = [
        'id'
      , 'created_at'
      , 'updated_at'
      , 'slug_name'
      , 'display_name'
      , 'tags'
      , 'privacy'
      , 'created_by'
    ]
    this.table = 'emoji_collection'
    this.clazz = EmojiCollections
}
_.extend(EmojiCollectionPersistenceService, StaticMixin)
_.extend(EmojiCollectionPersistenceService.prototype, QueryMixin.prototype)

module.exports = EmojiCollectionPersistenceService
