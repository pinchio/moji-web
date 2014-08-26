var _ = require('underscore')
  , QueryMixin = require('src/common/server/QueryMixin')
  , Emojis = require('./Emojis')
  , StaticMixin = require('src/common/StaticMixin')

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
      , 'asset_hash'
      , 'sent_count'
      , 'saved_count'
      , 'emoji_collection_id'
      , 'extra_data'
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

EmojiPersistenceService.prototype.select_by_created_by__emoji_collection_id__scopes__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where emoji_collection_id = $1 and (created_by = $2 or scopes @> $3) and deleted_at is null '
              + 'order by updated_at desc'
      , values = [req.emoji_collection_id, req.created_by, '{' + req.scopes.join(',') + '}']

    return yield this.query({query: query, values: values})
}

EmojiPersistenceService.prototype.select_by_query__created_by = function * (req) {
    var query = 'select ' + this.columns_string() + ' '
              + 'from ('
                  + 'select ' + this.columns_string() + ', '
                  + 'row_number() over(partition by asset_hash order by sent_count desc, updated_at desc) as rn '
                  + 'from ' + this.table + ' '
                  + 'where (created_by = $1 or \'public_read\' = any(scopes)) '
                  + 'and ('
                      + 'to_tsvector(\'english\', array_to_string(tags, \',\')) '
                      + '@@ to_tsquery(\'english\', $2) or '
                      + 'to_tsvector(\'english\', display_name) '
                      + '@@ to_tsquery(\'english\', $2)'
                  + ') '
                  + 'and deleted_at is null '
              + ') b '
              + 'where b.rn = 1 '
              + 'order by sent_count desc, updated_at desc '
              + 'limit 100'
      , values = [req.created_by, req.query]

    return yield this.query({query: query, values: values})
}

module.exports = EmojiPersistenceService
