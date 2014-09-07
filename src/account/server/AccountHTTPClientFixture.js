var _ = require('underscore')
  , request = require('request')
  , uuid = require('node-uuid')
  , StaticMixin = require('src/common/StaticMixin')

var AccountHTTPClientFixture = function AccountHTTPClientFixture() {
    this.ns = 'AccountHTTPClientFixture'
}
_.extend(AccountHTTPClientFixture, StaticMixin)

AccountHTTPClientFixture.prototype.post = function * (o) {
    o.ctx.jar = o.ctx.jar || request.jar()

    var body = _.defaults({
            username: Math.floor(Math.random() * 1000000000)
          , password: 'password'
          , email: uuid.v4().substring(0, 15) + '@b.com'
          , profile_image_url: 'someurl.png'
        }, o.body)
      , result = yield AccountHTTPClient.post({body: body, jar: o.ctx.jar})

    o.ctx.responses = o.ctx.responses || []
    o.ctx.responses.push(result[0])

    // Fields are {key -> value}
    // Maps ctx[value] = result[key]
    if (o.fields) {
        var keys = Object.keys(o.fields)

        for (var i = 0, ii = keys.length; i < ii; ++i) {
            var key = keys[i]
            o.ctx[o.fields[key]] = result[1][key]
        }
    }

    return result
}

module.exports = AccountHTTPClientFixture

var AccountHTTPClient = require('./AccountHTTPClient').get_instance()
