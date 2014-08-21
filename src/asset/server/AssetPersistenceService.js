var _ = require('underscore')
  , QueryMixin = require('src/common').QueryMixin
  , Assets = require('src/asset/server/Assets')
  , StaticMixin = require('src/common/StaticMixin')

var AssetPersistenceService = function AssetPersistenceService() {
    this.ns = 'AssetPersistenceService'
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
      , 'image_collection_id'
      , 'extra_data'
    ]
    this.table = 'asset'
    this.clazz = Assets
}
_.extend(AssetPersistenceService, StaticMixin)
_.extend(AssetPersistenceService.prototype, QueryMixin.prototype)

AssetPersistenceService.prototype.select_by_created_by__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where created_by = $1 and deleted_at is null'
      , values = [req.created_by]

    return yield this.query({query: query, values: values})
}

AssetPersistenceService.prototype.select_by_created_by__image_collection_id__scopes__not_deleted = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where image_collection_id = $1 and (created_by = $2 or scopes @> $3) and deleted_at is null '
              + 'order by updated_at desc'
      , values = [req.image_collection_id, req.created_by, '{' + req.scopes.join(',') + '}']

    return yield this.query({query: query, values: values})
}

AssetPersistenceService.prototype.select_by_query__created_by__not_deleted = function * (req) {
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

module.exports = AssetPersistenceService
