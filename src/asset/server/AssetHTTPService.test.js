var assert = require('chai').assert
  , _ = require('underscore')
  , fs = require('fs')
  , server = require('src/server/server/Server').get_instance()
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')
  , uuid = require('node-uuid')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('AssetHTTPService', function() {
    describe('post', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
          , stored_account
          , stored_jar = request.jar()

        it('should create session if login correct', function(done) {
            request(
                {
                    url: get_url('/_/api/account')
                  , method: 'POST'
                  , json: {
                        username: username
                      , password: password
                      , email: email
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    stored_account = body.account
                    done()
                }
            )
        })

        it('should not allow upload of asset if no session', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/asset')
                  , method: 'POST'
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should not allow upload of asset if extension not valid', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/asset')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Original file name extension not supported.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.bad')))
        })

       it.skip('should create asset', function(done) {
            this.timeout(10000)
            var req = request(
                {
                    url: get_url('/_/api/asset')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.asset)
                    assert.isDefined(body.asset.asset_url)
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })
    })
})
