var _ = require('underscore')
  , request = require('request')
  , uuid = require('node-uuid')
  , StaticMixin = require('src/common/StaticMixin')

var SessionHTTPClientFixture = function SessionHTTPClientFixture() {
    this.ns = 'SessionHTTPClientFixture'

    // This token was created by Charlie on Sept 10, 2014.
    this.fb_access_token = 'CAAMS24UXQZAABACkFLDwRZAUVm9x4DGALuIPU3GXShUSqQWkGgyPueNG12ZBxvkeq68mErLaX4tqe1iFZCYo3h5HxQQGM9sx6827Itd4pM446kPtgjwhxDocV84QkyiBEwZAgPWu5228RZCJoMNOALYBNHK4B4qGBTbvIuQawevQiqMp4XZCzwjOG3gbKAK89Icth3DOmUWkcAAsLtc18Mq'
}
_.extend(SessionHTTPClientFixture, StaticMixin)

SessionHTTPClientFixture.prototype.post = function * (o) {
    var body = _.defaults({}, o.body, {
            username: Math.floor(Math.random() * 1000000000)
          , password: 'password'
        })
      , result = yield SessionHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

SessionHTTPClientFixture.prototype.post_by_fb_access_token = function * (o) {
    var body = _.defaults({}, o.body, {
            fb_access_token: this.fb_access_token
        })
      , result = yield SessionHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

SessionHTTPClientFixture.prototype.del = function * (o) {
    var body = _.defaults({}, o.body, {})
      , result = yield SessionHTTPClient.del({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

module.exports = SessionHTTPClientFixture

var SessionHTTPClient = require('./SessionHTTPClient').get_instance()
