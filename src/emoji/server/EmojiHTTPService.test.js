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
          , stored_emoji_collection

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

        it('should not allow upload of emoji if no session', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not allow upload of emoji if no emoji_collection_id', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Emoji collection ids contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not allow upload of emoji if extension not valid', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Asset extension not supported.')
                    done()
                }
            )

            var form = req.form()
            form.append('emoji_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.bad')))
        })

        it('should not allow upload of emoji if emoji_collection_id does not exist', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Invalid emoji collection id.')
                    done()
                }
            )

            var form = req.form()
            form.append('emoji_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should create emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection.id)
                    stored_emoji_collection = body.emoji_collection
                    done()
            })
        })

        it('should create emoji', function(done) {
            var display_name = 'Super emoji'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/emoji')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.isDefined(body.emoji.id)
                    assert.isDefined(body.emoji.created_at)
                    assert.isDefined(body.emoji.updated_at)
                    assert.equal(body.emoji.deleted_at, null)
                    assert.equal(body.emoji.display_name, display_name)
                    assert.equal(body.emoji.tags[0], tags[0])
                    assert.equal(body.emoji.tags[1], tags[1])
                    assert.equal(body.emoji.created_by, stored_account.id)
                    assert.isDefined(body.emoji.asset_url)
                    assert.equal(body.emoji.emoji_collection_id, stored_emoji_collection.id)
                    done()
                }
            )

            var form = req.form()
            form.append('emoji_collection_id', stored_emoji_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })
    })
})