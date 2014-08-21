var _ = require('underscore')
  , Moment = require('moment')
  , uuid = require('node-uuid')
  , validator = require('validator')
  , ModelMixin = require('../../common/ModelMixin')
  , LocalServiceError = require('src/common').LocalServiceError

var Asset = function(o) {
    var self = this

    this.ns = 'Asset'
    Asset.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(Asset, ModelMixin)
Asset.keys = [
    'id'
  , 'created_at'
  , 'updated_at'
  , 'deleted_at'
  , 'created_by'
  , 'asset_url'
]

Asset.from_create = function(o) {
    return new Asset({
        id: o.id || uuid.v4()
      , created_at: 'now()'
      , updated_at: 'now()'
      , deleted_at: null
      , created_by: o.created_by
      , asset_url: o.asset_url
    })
}

Asset.from_db = function(o) {
    return new Asset({
        id: o.id
      , created_at: Asset.to_moment(o.created_at)
      , updated_at: Asset.to_moment(o.updated_at)
      , deleted_at: Asset.to_moment(o.deleted_at)
      , created_by: o.created_by
      , asset_url: o.asset_url
    })
}

Asset.prototype.to_json = function() {
    return {
        id: this.id
      , created_at: Asset.from_moment(this.created_at)
      , updated_at: Asset.from_moment(this.updated_at)
      , deleted_at: Asset.from_moment(this.deleted_at)
      , created_by: this.created_by
      , asset_url: this.asset_url
    }
}

Asset.prototype.to_privileged = function() {
    return {
        id: this.id
      , created_at: Asset.from_moment(this.created_at)
      , updated_at: Asset.from_moment(this.updated_at)
      , deleted_at: Asset.from_moment(this.deleted_at)
      , created_by: this.created_by
      , asset_url: this.asset_url
    }
}

Asset.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: Asset.from_moment(this.created_at)
      , updated_at: Asset.from_moment(this.updated_at)
      , deleted_at: Asset.from_moment(this.deleted_at)
      , created_by: this.created_by
      , asset_url: this.asset_url
    }
}

module.exports = Asset
