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

// TODO: if PUT and created_at
EmojiCollectionHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield EmojiCollectionLocalService.get_by_id({
                    req: this.request
                  , id: this.params.id
                })

            if (account) {
                if (this.session.account_id === account.id) {
                    return self.handle_success(this, {account: account.to_privileged()}, 'json')
                } else {
                    return self.handle_success(this, {account: account.to_json()}, 'json')
                }
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = EmojiCollectionHTTPService
