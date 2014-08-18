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
      , 'extra_data'
    ]
    this.table = 'emoji_collection'
    this.clazz = EmojiCollections
}
_.extend(EmojiCollectionPersistenceService, StaticMixin)
_.extend(EmojiCollectionPersistenceService.prototype, QueryMixin.prototype)

EmojiCollectionPersistenceService.prototype.select_by_created_by__scopes__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where created_by = $1 and scopes @> $2 and deleted_at is null'
      , values = [req.created_by, '{' + req.scopes.join(',') + '}']

    return yield this.query({query: query, values: values})
}

EmojiCollectionPersistenceService.prototype.select_by_query__created_by__not_deleted = function * (req) {
   var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where (created_by = $1 or \'public_read\' = any(scopes)) '
              + 'and ('
                  + 'to_tsvector(\'english\', array_to_string(tags, \',\')) '
                  + '@@ to_tsquery(\'english\', $2) or '
                  + 'to_tsvector(\'english\', display_name) '
                  + '@@ to_tsquery(\'english\', $2)'
              + ') '
              + 'and deleted_at is null '
              + 'order by updated_at desc '
              + 'limit 100'
      , values = [req.created_by, req.query]

    return yield this.query({query: query, values: values})
}

module.exports = EmojiCollectionPersistenceService
