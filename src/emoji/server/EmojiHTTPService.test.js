var assert = require('chai').assert
  , fs = require('fs')
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('EmojiHTTPService', function() {
    describe('post', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
          , stored_account
          , stored_jar

        it('should create session if login correct', function(done) {
            stored_jar = request.jar()

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

        it('should allow upload of emoji', function(done) {
            this.timeout(10000)
            var req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    done()
                }
            )

            var form = req.form()
            form.append('my_field', 'my_value')
            form.append('my_file', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        // if no session upload should fail
    })
})