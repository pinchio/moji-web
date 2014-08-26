var assert = require('chai').assert
  , config = require('config')
  , fs = require('fs')
  , host = config.get('server').host
  , path = require('path')
  , port = config.get('server').port
  , request = require('request')
  , server = require('src/server/server/Server').get_instance()
  , uuid = require('node-uuid')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe.only('EventHTTPService', function() {
    describe('post', function () {
        var stored_event
          , stored_jar = request.jar()
          , stored_account

        it('should create account', function(done) {
            var username = Math.floor(Math.random() * 1000000000)
              , password = 'password'
              , email = uuid.v4().substring(0, 15) + '@b.com'

            request({
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
                    assert.equal(d.statusCode, 200)
                    stored_account = body.account
                    done()
            })
        })

        it('should create emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: ''
                      , tags: []
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_emoji_collection = body.emoji_collection
                    done()
            })
        })

        it('should create emoji', function(done) {
            this.timeout(10000)
            var display_name = ''
              , tags = []
              , req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    stored_emoji = body.emoji
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', stored_emoji_collection.id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should create emoji_sent event and increment send_count', function(done) {
            request({
                    url: get_url('/_/api/event')
                  , method: 'POST'
                  , json: {
                        event: 'emoji_sent'
                      , properties: {
                            emoji_id: stored_emoji.id
                          , destination: 'Messages.app'
                        }
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should get emoji with sent_count incremented', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.equal(body.emoji.sent_count, stored_emoji.sent_count + 1)
                    stored_emoji = body.emoji
                    done()
            })
        })

        it('should create emoji_sent event and increment send_count', function(done) {
            request({
                    url: get_url('/_/api/event')
                  , method: 'POST'
                  , json: {
                        event: 'emoji_sent'
                      , properties: {
                            emoji_id: stored_emoji.id
                          , destination: 'Messages.app'
                        }
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should get emoji with sent_count incremented', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.equal(body.emoji.sent_count, stored_emoji.sent_count + 1)
                    stored_emoji = body.emoji
                    done()
            })
        })
    })
})