var assert = require('chai').assert
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')
  , uuid = require('node-uuid')
  , fs = require('fs')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe.skip('SearchHTTPService', function() {
    describe('list', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_account
          , stored_emoji_collection
          , stored_emoji
          , stored_jar = request.jar()

        it('should create account', function(done) {
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

        it('should create emoji', function(done) {
            this.timeout(10000)
            var display_name = 'Cute emoji'
              , tags = ['cat', 'tv']
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
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../emoji/panda-dog.jpg')))
        })

        it('should find emojis if matching one tag', function(done) {
            var query = encodeURIComponent('cats')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji)
                    done()
            })
        })

        it('should find emojis if matching another tag', function(done) {
            var query = encodeURIComponent('tv')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji)
                    done()
            })
        })

        it('should find emojis if matching both tags', function(done) {
            var query = encodeURIComponent('cats tv')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji)
                    done()
            })
        })

        it('should not find emojis if does not match both tags', function(done) {
            var query = encodeURIComponent('cats dragons')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)

                    var actual_id = body.emojis[0] && body.emojis[0].id

                    assert.notEqual(actual_id, stored_emoji.id)
                    done()
            })
        })

        it('should find emojis if different capitalization', function(done) {
            var query = encodeURIComponent('CATS')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji)
                    done()
            })
        })

        it('should find emojis if different plurality', function(done) {
            var query = encodeURIComponent('cat')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji)
                    done()
            })
        })

        it('should delete emoji', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'DELETE'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should not find deleted emojis', function(done) {
            var query = encodeURIComponent('cat')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)

                    var actual_id = body.emojis[0] && body.emojis[0].id
                    assert.notEqual(actual_id, stored_emoji.id)
                    done()
            })
        })

        it('should find emoji collections through display_name', function(done) {
            var query = encodeURIComponent('super')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.deepEqual(body.emoji_collections[0], stored_emoji_collection)
                    done()
            })
        })

        it('should find emoji collections through tags', function(done) {
            var query = encodeURIComponent('cute')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.deepEqual(body.emoji_collections[0], stored_emoji_collection)
                    done()
            })
        })

        it('should delete emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'DELETE'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should not find deleted emoji collections', function(done) {
            var query = encodeURIComponent('cute')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    var actual_id = body.emoji_collections[0] && body.emoji_collections[0].id
                    assert.notEqual(actual_id, stored_emoji_collection.id)
                    done()
            })
        })

        // Do not find deleted ones
    })
})
