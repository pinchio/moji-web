var HTTPServiceMixin = require('src/common').HTTPServiceMixin
  , _ = require('underscore')
  , StaticMixin = require('../../common/StaticMixin')
  , EmojiLocalService = require('./EmojiLocalService').get_instance()
  , co_busboy = require('co-busboy')
  , fs = require('fs')
  , uuid = require('node-uuid')
  , co = require('co')
  , thunkify = require('thunkify')
  , LocalServiceError = require('src/common').LocalServiceError

var EmojiHTTPService = function EmojiHTTPService() {
    this.ns = 'EmojiHTTPService'
}
_.extend(EmojiHTTPService, StaticMixin)
_.extend(EmojiHTTPService.prototype, HTTPServiceMixin.prototype)

EmojiHTTPService.prototype.part_stream_finish = thunkify(function(part, stream, cb) {
    stream.on('finish', cb)
    part.pipe(stream)
})

// EmojiHTTPService.prototype.post = function() {
//     var self = this

//     return function * (next) {
//         try {
//             var session = this.session
//               , parts = co_busboy(this)
//               , part
//               , body = {}
//               , image_part

//             while (part = yield parts) {
//                 if (part.length) {
//                     // Non asset fields.

//                     // If array field.
//                     // Comes in like tags[] = 'foo', tags[] == 'bar'.
//                     if (part[0].indexOf('[]') === part[0].length - 2) {
//                         var key = part[0].substring(0, part[0].length - 2)
//                         body[key] = body[key] || []
//                         body[key].push(part[1])
//                     } else {
//                         body[part[0]] = part[1]
//                     }
//                 } else if (part.fieldname === 'asset') {
//                     image_part = part
//                     var local_file_name = '/tmp/' + uuid.v4()
//                       , stream = fs.createWriteStream(local_file_name)
//                       , original_file_name = image_part.filename
//                       , stream_finished = yield self.part_stream_finish(image_part, stream)
//                 } else {
//                     throw new LocalServiceError(this.ns, 'bad_request', part.fieldname + ' is not a valid field.', 400)
//                 }
//             }

//             if (!image_part) {
//                 throw new LocalServiceError(this.ns, 'bad_request', 'Emojis must include an asset.', 400)
//             }

//             var emoji = yield EmojiLocalService.create({
//                     display_name: body.display_name
//                   , tags: body.tags
//                   , scopes: body.scopes
//                   , local_file_name: local_file_name
//                   , original_file_name: original_file_name
//                   , emoji_collection_id: body.emoji_collection_id
//                   , session: session
//                 })

//             return self.handle_success(this, {emoji: emoji.to_privileged()}, 'json')
//         } catch(e) {
//             self.handle_exception(this, e)
//         }
//     }
// }

EmojiHTTPService.prototype.put = function() {
    var self = this

    return function * (next) {
        try {
            var session = this.session
              , parts = co_busboy(this)
              , part
              , body = {}
              , image_part

            while (part = yield parts) {
                if (part.length) {
                    // Non asset fields.

                    // If array field.
                    // Comes in like tags[] = 'foo', tags[] == 'bar'.
                    if (part[0].indexOf('[]') === part[0].length - 2) {
                        var key = part[0].substring(0, part[0].length - 2)
                        body[key] = body[key] || []
                        body[key].push(part[1])
                    } else {
                        body[part[0]] = part[1]
                    }
                } else if (part.fieldname === 'asset') {
                    image_part = part
                    var local_file_name = '/tmp/' + uuid.v4()
                      , stream = fs.createWriteStream(local_file_name)
                      , original_file_name = image_part.filename
                      , stream_finished = yield self.part_stream_finish(image_part, stream)
                } else {
                    throw new LocalServiceError(this.ns, 'bad_request', part.fieldname + ' is not a valid field.', 400)
                }
            }

            if (!image_part) {
                throw new LocalServiceError(this.ns, 'bad_request', 'Emojis must include an asset.', 400)
            }

            var emoji = yield EmojiLocalService.upsert({
                    id: body.id
                  , created_at: body.created_at
                  , updated_at: body.updated_at
                  , display_name: body.display_name
                  , tags: body.tags
                  , scopes: body.scopes
                  , created_by: body.created_by
                  , local_file_name: local_file_name
                  , original_file_name: original_file_name
                  , emoji_collection_id: body.emoji_collection_id
                  , session: session
                })

            return self.handle_success(this, {emoji: emoji.to_privileged()}, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiHTTPService.prototype.get = function() {
    var self = this

    return function * (next) {
        try {
            var emoji = yield EmojiLocalService.get_by_id({
                    req: this.request
                  , id: this.params.id
                  , session: this.session
                })

            if (emoji) {
                if (this.session.account_id === emoji.created_by) {
                    return self.handle_success(this, {emoji: emoji.to_privileged()}, 'json')
                } else {
                    return self.handle_success(this, {emoji: emoji.to_json()}, 'json')
                }
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiHTTPService.prototype.list = function() {
    var self = this

    return function * (next) {
        try {
            if (this.query.emoji_collection_id) {
                var emojis = yield EmojiLocalService.get_by_created_by__emoji_collection_id({
                        emoji_collection_id: this.query.emoji_collection_id
                      , req: this.request
                      , session: this.session
                    })
            } else {
                var emojis = yield EmojiLocalService.get_by_created_by({
                        req: this.request
                      , session: this.session
                    })
            }

            if (emojis) {
                return self.handle_success(this, {emojis: emojis.to_json()}, 'json')
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

EmojiHTTPService.prototype.del = function() {
    var self = this

    return function * (next) {
        try {
            var emoji = yield EmojiLocalService.delete_by_id({
                    req: this.request
                  , id: this.params.id
                  , session: this.session
                })

            if (emoji) {
                return self.handle_success(this, {}, 'json')
            } else {
                return self.handle_success(this, null)
            }
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = EmojiHTTPService
