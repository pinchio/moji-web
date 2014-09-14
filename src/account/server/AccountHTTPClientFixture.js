var _ = require('underscore')
  , request = require('request')
  , uuid = require('node-uuid')
  , StaticMixin = require('src/common/StaticMixin')

var AccountHTTPClientFixture = function AccountHTTPClientFixture() {
    this.ns = 'AccountHTTPClientFixture'

    // This token was created by Charlie on Sept 10, 2014.
    this.fb_access_token = 'CAAMS24UXQZAABACkFLDwRZAUVm9x4DGALuIPU3GXShUSqQWkGgyPueNG12ZBxvkeq68mErLaX4tqe1iFZCYo3h5HxQQGM9sx6827Itd4pM446kPtgjwhxDocV84QkyiBEwZAgPWu5228RZCJoMNOALYBNHK4B4qGBTbvIuQawevQiqMp4XZCzwjOG3gbKAK89Icth3DOmUWkcAAsLtc18Mq'
}
_.extend(AccountHTTPClientFixture, StaticMixin)

AccountHTTPClientFixture.prototype.post = function * (o) {
    var body = _.defaults({}, o.body, {
            username: Math.floor(Math.random() * 1000000000)
          , password: 'password'
          , email: uuid.v4().substring(0, 15) + '@b.com'
          , profile_image_url: 'someurl.png'
          , born_at: (new Date).toISOString()
        })
      , result = yield AccountHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

AccountHTTPClientFixture.prototype.post_by_fb_access_token = function * (o) {
    var body = _.defaults({}, o.body, {
            username: Math.floor(Math.random() * 1000000000)
          , email: uuid.v4().substring(0, 15) + '@b.com'
          , fb_access_token: this.fb_access_token
          , profile_image_url: 'someurl.png'
          , born_at: (new Date).toISOString()
        })
      , result = yield AccountHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

AccountHTTPClientFixture.prototype.put = function * (o) {
    var result = yield AccountHTTPClient.put({id: o.id, body: o.body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

AccountHTTPClientFixture.prototype.get = function * (o) {
    var result = yield AccountHTTPClient.get({id: o.id, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

module.exports = AccountHTTPClientFixture

var AccountHTTPClient = require('./AccountHTTPClient').get_instance()
