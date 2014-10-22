var _ = require('underscore')
  , EmojiCollectionFollowers = require('./EmojiCollectionFollowers')
  , QueryMixin = require('src/common/server/QueryMixin')
  , StaticMixin = require('src/common/StaticMixin')

var EmojiCollectionFollowerPersistenceService = function EmojiCollectionFollowerPersistenceService() {
    this.ns = 'EmojiCollectionFollowerPersistenceService'
    this.columns = [
        'id'
      , 'created_at'
      , 'emoji_collection_id'
      , 'follower'
    ]
    this.table = 'emoji_collection_follower'
    this.clazz = EmojiCollectionFollowers
}
_.extend(EmojiCollectionFollowerPersistenceService, StaticMixin)
_.extend(EmojiCollectionFollowerPersistenceService.prototype, QueryMixin.prototype)

EmojiCollectionFollowerPersistenceService.prototype.select_by_follower = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where follower = $1 '
              + 'order by created_at desc'
      , values = [req.follower]

    return yield this.query({query: query, values: values})
}

module.exports = EmojiCollectionFollowerPersistenceService
