var _ = require('underscore')
  , QueryMixin = require('src/common').QueryMixin
  , Emojis = require('./Emojis')
  , StaticMixin = require('../../common/StaticMixin')

var EmojiPersistenceService = function EmojiPersistenceService() {
    this.ns = 'EmojiPersistenceService'
    this.columns = [
        'id'
      , 'created_at'
      , 'updated_at'
      , 'slug_name'
      , 'display_name'
      , 'image_url'
      , 'tags'
      , 'privacy'
      , 'created_by'
    ]
    this.table = 'emoji'
    this.clazz = Emojis
}
_.extend(EmojiPersistenceService, StaticMixin)
_.extend(EmojiPersistenceService.prototype, QueryMixin.prototype)

EmojiPersistenceService.prototype.select_by_username = function * (req) {
    var query = 'select * '
              + 'from ' + this.table + ' '
              + 'where username = $1 '
      , values = [req.username]

    return yield this.query({query: query, values: values})
}

module.exports = EmojiPersistenceService
