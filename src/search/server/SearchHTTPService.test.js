var assert = require('chai').assert
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

describe('SearchHTTPService', function() {
    describe('list', function() {
        var stored_account
          , stored_emoji_collection
          , stored_emoji
          , stored_jar = request.jar()
          , stored_jar2 = request.jar()
          , stored_emoji_collection2
          , stored_emoji2
          , stored_emoji3

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
            this.timeout(60000)
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

        it('should create another account', function(done) {
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
                  , jar: stored_jar2
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_account2 = body.account
                    done()
            })
        })

        it('should create another emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Cant touch this'
                      , tags: []
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar2
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_emoji_collection2 = body.emoji_collection
                    done()
            })
        })

        it('should create private emoji', function(done) {
            this.timeout(60000)
            var display_name = 'Push'
              , tags = ['cat', 'pusheen', 'searchemoji']
              , req = request(
                    {
                        url: get_url('/_/api/emoji')
                      , method: 'POST'
                      , jar: stored_jar2
                    }
                  , function(e, d, body) {
                        body = JSON.parse(body)
                        assert.equal(d.statusCode, 200)
                        stored_emoji2 = body.emoji
                        done()
                    }
                )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account2.id)
            form.append('emoji_collection_id', stored_emoji_collection2.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('tags[]', tags[2])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/pusheen.gif')))
        })

        it('author of private can find both private and public emojis', function(done) {
            var query = encodeURIComponent('searchemoji')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar2
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji2)
                    assert.deepEqual(body.emojis[1], stored_emoji)
                    done()
            })
        })

        it('should create private emoji thats a duplicate', function(done) {
            this.timeout(60000)
            var display_name = 'Panda'
              , tags = ['panda', 'searchemoji']
              , req = request(
                    {
                        url: get_url('/_/api/emoji')
                      , method: 'POST'
                      , jar: stored_jar2
                    }
                  , function(e, d, body) {
                        body = JSON.parse(body)
                        assert.equal(d.statusCode, 200)
                        stored_emoji3 = body.emoji
                        done()
                    }
                )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account2.id)
            form.append('emoji_collection_id', stored_emoji_collection2.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('author of private cannot find duplicates', function(done) {
            var query = encodeURIComponent('searchemoji')
            request({
                    url: get_url('/_/api/search?q=' + query)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar2
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji3)
                    assert.deepEqual(body.emojis[1], stored_emoji2)
                    done()
            })
        })

        it('other user cannot find private emojis', function(done) {
            var query = encodeURIComponent('searchemoji')
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
                    url: get_url('/_/api/search?q=' + query + '&expand=emojis.created_by,emojis.ancestor_emoji_id,emojis.ancestor_emoji_id_expanded.created_by')
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
    })
})
