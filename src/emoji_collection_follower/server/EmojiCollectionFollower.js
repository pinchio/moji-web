var _ = require('underscore')
  , LocalServiceError = require('src/common/server/LocalServiceError')
  , ModelMixin = require('src/common/ModelMixin')
  , Moment = require('moment')
  , uuid = require('node-uuid')

var EmojiCollectionFollower = function(o) {
    var self = this

    this.ns = 'EmojiCollectionFollower'
    EmojiCollectionFollower.keys.forEach(function(key) {
        self[key] = o[key]
    })
}
_.extend(EmojiCollectionFollower, ModelMixin)

EmojiCollectionFollower.keys = [
    'id'
  , 'created_at'
  , 'emoji_collection_id'
  , 'follower'
]

EmojiCollectionFollower.from_create = function(o) {
    return new EmojiCollectionFollower({
        id: uuid.v4()
      , created_at: 'now()'
      , emoji_collection_id: o.emoji_collection_id
      , follower: o.follower
    })
}

EmojiCollectionFollower.from_db = function(o) {
    return new EmojiCollectionFollower({
        id: o.id
      , created_at: EmojiCollectionFollower.to_moment(o.created_at)
      , emoji_collection_id: o.emoji_collection_id
      , follower: o.follower
    })
}

EmojiCollectionFollower.prototype.to_db = function() {
    return {
        id: this.id
      , created_at: EmojiCollectionFollower.from_moment(this.created_at)
      , emoji_collection_id: this.emoji_collection_id
      , follower: this.follower
    }
}

module.exports = EmojiCollectionFollower
