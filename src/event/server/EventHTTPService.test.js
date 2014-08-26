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

describe('EventHTTPService', function() {
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
                        display_name: 'Pusheen super pack'
                      , tags: ['cats', 'cute']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_emoji_collection = body.emoji_collection
                    done()
            })
        })

        it('should create public emoji', function(done) {
            this.timeout(10000)
            var display_name = 'Cute emoji'
              , tags = ['cat', 'tv', 'searchemoji']
            var req = request(
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
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('tags[]', tags[2])
            form.append('scopes[]', 'public_read')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should create send_event and increment send_count', function(done) {
            request({
                    url: get_url('/_/api/event')
                  , method: 'POST'
                  , json: {
                        event: 'emoji_send'
                      , properties: {
                            destination: 'Messages.app'
                        }
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        // it('should create event if without born_at if born_at not set', function(done) {
        //     var username = Math.floor(Math.random() * 1000000000)
        //       , password = 'password'
        //       , email = uuid.v4().substring(0, 15) + '@b.com'
        //       , stored_jar = request.jar()

        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: password
        //               , email: email
        //             }
        //           , jar: stored_jar
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 200)
        //             assert.equal(body.event.born_at, null)
        //             done()
        //     })
        // })

        // it('should not allow duplicate username', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: password
        //               , email: email
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 409)
        //             assert.equal(body.type, 'conflict')
        //             assert.equal(body.description, 'Username is taken.')
        //             done()
        //     })
        // })

        // it('should not allow duplicate email', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: 'ab' + Date.now()
        //               , password: password
        //               , email: email
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 409)
        //             assert.equal(body.type, 'conflict')
        //             assert.equal(body.description, 'Email is taken.')
        //             done()
        //     })
        // })

        // it('should not allow empty usernames', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: null
        //               , password: password
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Username must be between 3 and 15 characters.')
        //             done()
        //     })
        // })

        // it('should not allow short usernames', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: 'a'
        //               , password: password
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Username must be between 3 and 15 characters.')
        //             done()
        //     })
        // })

        // it('should not allow long usernames', function(done) {
        //     // Date.now() is 13 chars.
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: '1234567890123456'
        //               , password: password
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Username must be between 3 and 15 characters.')
        //             done()
        //     })
        // })

        // it('should not allow non-alphanumeric characters in username', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: '___'
        //               , password: password
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Username can only contain letters and numbers.')
        //             done()
        //     })
        // })

        // it('should not allow empty passwords', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: null
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Password must be between 6 and 50 characters.')
        //             done()
        //     })
        // })

        // it('should not allow short passwords', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: '12345'
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Password must be between 6 and 50 characters.')
        //             done()
        //     })
        // })

        // it('should not allow long passwords', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: (Array(52)).join('a')
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Password must be between 6 and 50 characters.')
        //             done()
        //     })
        // })

        // it('should not allow non-alphanumeric characters in password', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: '12345670__'
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Password can only contain letters and numbers.')
        //             done()
        //     })
        // })

        // it('should not allow empty emails', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: password
        //               , email: null
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Email is not valid.')
        //             done()
        //     })
        // })

        // it('should not allow invalid emails', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: password
        //               , email: 'a@b'
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Email is not valid.')
        //             done()
        //     })
        // })

        // it('should not allow invalid emails', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: password
        //               , email: '@b.com'
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Email is not valid.')
        //             done()
        //     })
        // })

        // it('should not allow bad profile_image_urls', function(done) {
        //     request({
        //             url: get_url('/_/api/event')
        //           , method: 'POST'
        //           , json: {
        //                 username: username
        //               , password: password
        //               , email: 'a@b.com'
        //               , profile_image_url: 'bad.exe'
        //             }
        //         }
        //       , function(e, d, body) {
        //             assert.equal(d.statusCode, 400)
        //             assert.equal(body.type, 'bad_request')
        //             assert.equal(body.description, 'Profile image url extension not supported.')
        //             done()
        //     })
        // })
    })
})