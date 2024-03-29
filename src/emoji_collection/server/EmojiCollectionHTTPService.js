var HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , _ = require('underscore')
  , StaticMixin = require('src/common/StaticMixin')
  , EmojiCollectionLocalService = require('./EmojiCollectionLocalService').get_instance()
  , co_busboy = require('co-busboy')
  , fs = require('fs')
  , uuid = require('node-uuid')
  , thunkify = require('thunkify')

var EmojiCollectionHTTPService = function EmojiCollectionHTTPService() {
    this.ns = 'EmojiCollectionHTTPService'
}
_.extend(EmojiCollectionHTTPService, StaticMixin)
_.extend(EmojiCollectionHTTPService.prototype, HTTPServiceMixin.prototype)

EmojiCollectionHTTPService.prototype.post = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection = yield EmojiCollectionLocalService.create({
                    display_name: this.request.body && this.request.body.display_name
                  , tags: this.request.body && this.request.body.tags
                  , scopes: this.request.body && this.request.body.scopes
                  , extra_data: this.request.body && this.request.body.extra_data
                  , session: this.session
                })
              , expand = self.parse_expand(this.query.expand)

            return self.handle_success(this, {emoji_collection: yield emoji_collection.to_json({
                expand: expand && expand.emoji_collection
              , session: this.session
            })}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiCollectionHTTPService.prototype.put = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection = yield EmojiCollectionLocalService.upsert({
                    id: this.request.body && this.request.body.id
                  , created_at: this.request.body && this.request.body.created_at
                  , updated_at: this.request.body && this.request.body.updated_at
                  , display_name: this.request.body && this.request.body.display_name
                  , tags: this.request.body && this.request.body.tags
                  , scopes: this.request.body && this.request.body.scopes
                  , created_by: this.request.body && this.request.body.created_by
                  , extra_data: this.request.body && this.request.body.extra_data
                  , session: this.session
                })
              , expand = self.parse_expand(this.query.expand)

            return self.handle_success(this, {emoji_collection: yield emoji_collection.to_json({
                expand: expand && expand.emoji_collection
              , session: this.session
            })}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiCollectionHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection = yield EmojiCollectionLocalService.get_by_id({
                    req: this.request
                  , id: this.params.id
                  , session: this.session
                })
              , expand = self.parse_expand(this.query.expand)

            if (!emoji_collection) {
                return self.handle_success(this, null)
            }

            return self.handle_success(this, {emoji_collection: yield emoji_collection.to_json({
                expand: expand && expand.emoji_collection
              , session: this.session
            })}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiCollectionHTTPService.prototype.list = function() {
    var self = this

    return function * (next) {
        try {
            if (this.query.created_by) {
                var created_by = this.query.created_by
            } else {
                var created_by = this.session.account_id
            }

            var emoji_collections = yield EmojiCollectionLocalService.get_by_created_by__scopes({
                    req: this.request
                  , session: this.session
                  , created_by: created_by
                  , scopes: ['public_read']
                })
              , expand = self.parse_expand(this.query.expand)

            if (!emoji_collections) {
                return self.handle_success(this, {emoji_collections: []}, 'json')
            }

            return self.handle_success(this, {emoji_collections: yield emoji_collections.to_json({
                expand: expand && expand.emoji_collections
              , session: this.session
            })}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiCollectionHTTPService.prototype.del = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collection = yield EmojiCollectionLocalService.delete_by_id({
                    req: this.request
                  , id: this.params.id
                  , session: this.session
                })

            if (!emoji_collection) {
                return self.handle_success(this, null)
            }

            return self.handle_success(this, {}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = EmojiCollectionHTTPService
