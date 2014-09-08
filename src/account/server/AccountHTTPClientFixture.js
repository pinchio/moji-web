var _ = require('underscore')
  , request = require('request')
  , uuid = require('node-uuid')
  , StaticMixin = require('src/common/StaticMixin')

var AccountHTTPClientFixture = function AccountHTTPClientFixture() {
    this.ns = 'AccountHTTPClientFixture'
}
_.extend(AccountHTTPClientFixture, StaticMixin)

AccountHTTPClientFixture.prototype.post = function * (o) {
    var body = _.defaults({}, o.body, {
            username: Math.floor(Math.random() * 1000000000)
          , password: 'password'
          , email: uuid.v4().substring(0, 15) + '@b.com'
          , profile_image_url: 'someurl.png'
        })
      , result = yield AccountHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.update(result, o.fields)

    return result
}

module.exports = AccountHTTPClientFixture

var AccountHTTPClient = require('./AccountHTTPClient').get_instance()
