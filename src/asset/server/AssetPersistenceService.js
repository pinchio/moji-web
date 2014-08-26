var _ = require('underscore')
  , QueryMixin = require('src/common/server/QueryMixin')
  , Assets = require('src/asset/server/Assets')
  , StaticMixin = require('src/common/StaticMixin')

var AssetPersistenceService = function AssetPersistenceService() {
    this.ns = 'AssetPersistenceService'
    this.columns = [
        'id'
      , 'created_at'
      , 'updated_at'
      , 'deleted_at'
      , 'created_by'
      , 'asset_url'
    ]
    this.table = 'asset'
    this.clazz = Assets
}
_.extend(AssetPersistenceService, StaticMixin)
_.extend(AssetPersistenceService.prototype, QueryMixin.prototype)

module.exports = AssetPersistenceService
