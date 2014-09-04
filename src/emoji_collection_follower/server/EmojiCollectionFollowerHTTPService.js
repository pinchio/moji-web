var _ = require('underscore')
  , EmojiCollectionFollowerLocalService = require('./EmojiCollectionFollowerLocalService').get_instance()
  , HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , StaticMixin = require('src/common/StaticMixin')

var EmojiCollectionFollowerHTTPService = function EmojiCollectionFollowerHTTPService() {
    this.ns = 'EmojiCollectionFollowerHTTPService'
}
_.extend(EmojiCollectionFollowerHTTPService, StaticMixin)
_.extend(EmojiCollectionFollowerHTTPService.prototype, HTTPServiceMixin.prototype)

EmojiCollectionFollowerHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection_follower = yield EmojiCollectionFollowerLocalService.create({
                    emoji_collection_id: this.request.body && this.request.body.emoji_collection_id
                  , session: this.session
                })
              , expand = self.parse_expand(this.query.expand)

            return self.handle_success(this, {emoji_collection_follower: yield emoji_collection_follower.to_json({
                expand: expand && expand.emoji_collection_follower
              , session: this.session
            })}, 'json')
        } catch(e) {
            return self.handle_exception(this, e)
        }
    }
}

EmojiCollectionFollowerHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection_follower = yield EmojiCollectionFollowerLocalService.get_by_id({
                    id: this.params.id
                  , session: this.session
                })
              , expand = self.parse_expand(this.query.expand)

            if (!emoji_collection_follower) {
                return self.handle_success(this, null)
            }

            return self.handle_success(this, {emoji_collection_follower: yield emoji_collection_follower.to_json({
                expand: expand && expand.emoji_collection_follower
              , session: this.session
            })}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiCollectionFollowerHTTPService.prototype.del = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection_follower = yield EmojiCollectionFollowerLocalService.delete_by_id({
                    id: this.params.id
                  , session: this.session
                })

            if (!emoji_collection_follower) {
                return self.handle_success(this, null)
            }

            return self.handle_success(this, {}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = EmojiCollectionFollowerHTTPService
