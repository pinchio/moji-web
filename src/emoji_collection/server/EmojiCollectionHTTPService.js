var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , EmojiCollectionLocalService = require('./EmojiCollectionLocalService').get_instance()
  , co_busboy = require('co-busboy')
  , fs = require('fs')
  , uuid = require('node-uuid')
  , co = require('co')
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
                  , session: this.session
                })

            self.handle_success(this, {emoji_collection: emoji_collection.to_privileged()}, 'json')
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
                  , session: this.session
                })

            self.handle_success(this, {emoji_collection: emoji_collection.to_privileged()}, 'json')
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

            if (emoji_collection) {
                if (this.session.account_id === emoji_collection.created_by) {
                    return self.handle_success(this, {emoji_collection: emoji_collection.to_privileged()}, 'json')
                } else {
                    return self.handle_success(this, {emoji_collection: emoji_collection.to_json()}, 'json')
                }
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

// TODO: probably refactor to not pass in session and instead account_id EVERYWHERE
EmojiCollectionHTTPService.prototype.list = function() {
    var self = this

    return function * (next) {
        try {
            var emoji_collections = yield EmojiCollectionLocalService.get_by_created_by({
                    req: this.request
                  , session: this.session
                })

            if (emoji_collections) {
                return self.handle_success(this, {emoji_collections: emoji_collections.to_json()}, 'json')
            } else {
                return self.handle_success(this, null)
            }
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

            if (emoji_collection) {
                return self.handle_success(this, {}, 'json')
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = EmojiCollectionHTTPService
