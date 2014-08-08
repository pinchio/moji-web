var _ = require('underscore')
  , QueryMixin = require('src/common').QueryMixin
  , Emojis = require('./Emojis')
  , StaticMixin = require('../../common/StaticMixin')

var EmojiPersistenceService = function EmojiPersistenceService() {
    this.ns = 'EmojiPersistenceService'
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
      , 'asset_url'
      , 'emoji_collection_id'
    ]
    this.table = 'emoji'
    this.clazz = Emojis
}
_.extend(EmojiPersistenceService, StaticMixin)
_.extend(EmojiPersistenceService.prototype, QueryMixin.prototype)

EmojiPersistenceService.prototype.select_by_created_by__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where created_by = $1 and deleted_at is null'
      , values = [req.created_by]

    return yield this.query({query: query, values: values})
}

EmojiPersistenceService.prototype.select_by_created_by__emoji_collection_id__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where created_by = $1 and emoji_collection_id = $2 and deleted_at is null'
      , values = [req.created_by, req.emoji_collection_id]

    return yield this.query({query: query, values: values})
}

module.exports = EmojiPersistenceService
