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
      , 'deleted_at'
      , 'slug_name'
      , 'display_name'
      , 'tags'
      , 'scopes'
      , 'created_by'
    ]
    this.table = 'emoji_collection'
    this.clazz = EmojiCollections
}
_.extend(EmojiCollectionPersistenceService, StaticMixin)
_.extend(EmojiCollectionPersistenceService.prototype, QueryMixin.prototype)

EmojiCollectionPersistenceService.prototype.select_by_created_by__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where created_by = $1 and deleted_at is null'
      , values = [req.created_by]

    return yield this.query({query: query, values: values})
}

module.exports = EmojiCollectionPersistenceService
