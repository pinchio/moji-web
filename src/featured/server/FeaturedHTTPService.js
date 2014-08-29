var HTTPServiceMixin = require('src/common/server/HTTPServiceMixin')
  , _ = require('underscore')
  , StaticMixin = require('src/common/StaticMixin')
  , FeaturedLocalService = require('./FeaturedLocalService').get_instance()

var FeaturedHTTPService = function FeaturedHTTPService() {
    this.ns = 'FeaturedHTTPService'
}
_.extend(FeaturedHTTPService, StaticMixin)
_.extend(FeaturedHTTPService.prototype, HTTPServiceMixin.prototype)

FeaturedHTTPService.prototype.list = function() {
    var self = this

    return function * (next) {
        try {
            var results = yield FeaturedLocalService.get({
                    session: this.session
                  , req: this.request
                })
              , expand = self.parse_expand(this.query.expand)

            if (!results) {
                return self.handle_success(this, null)
            }

            return self.handle_success(this, {
                emojis: yield results.emojis.to_json({
                    expand: expand && expand.emojis
                  , session: this.session
                })
              // , emoji_collections: yield results.emoji_collections.to_json({
              //       expand: expand && expand.emoji_collections
              //     , session: this.session
              //   })
            }, 'json')
        } catch(e) {
            self.handle_exception(this, e)
        }
    }
}

module.exports = FeaturedHTTPService
