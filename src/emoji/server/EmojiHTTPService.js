var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , EmojiLocalService = require('./EmojiLocalService').get_instance()
  , co_busboy = require('co-busboy')
  , fs = require('fs')
  , uuid = require('node-uuid')
  , co = require('co')
  , thunkify = require('thunkify')

var EmojiHTTPService = function EmojiHTTPService() {
    this.ns = 'EmojiHTTPService'
}
_.extend(EmojiHTTPService, StaticMixin)
_.extend(EmojiHTTPService.prototype, HTTPServiceMixin.prototype)

EmojiHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var account = yield EmojiLocalService.get_by_id({
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

EmojiHTTPService.prototype.part_stream_finish = thunkify(function(part, stream, cb) {
    stream.on('finish', cb)
    part.pipe(stream)
})

EmojiHTTPService.prototype.post = function() {
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

    var self = this

    return function * (next) {
        try {
            var session = this.session
              , parts = co_busboy(this)
              , part
              , body = {}

            while (part = yield parts) {
                if (part.length) {
                    // Normal fields.
                    body[part[0]] = part[1]
                } else {
                    console.log(part)
                    // File streams.
                    var local_file_name = '/tmp/' + uuid.v4()
                      , stream = fs.createWriteStream(local_file_name)
                      , original_file_name = part.filename
                      , stream_finished = yield self.part_stream_finish(part, stream)
                      , emoji = yield EmojiLocalService.create({
                          , display_name: body.display_name
                          , tags: body.tags
                          , scopes: body.scopes
                          , local_file_name: local_file_name
                          , original_file_name: original_file_name
                          , emoji_collection_id: body.emoji_collection_id
                          , session: session
                        })

                    return self.handle_success(this, {emoji: emoji.to_privileged()}, 'json')
                }
            }

        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = EmojiHTTPService
