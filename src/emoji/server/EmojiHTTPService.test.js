var assert = require('chai').assert
  , _ = require('underscore')
  , fs = require('fs')
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')
  , uuid = require('node-uuid')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('EmojiHTTPService', function() {
    describe('post', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
          , stored_account
          , stored_jar = request.jar()
          , stored_emoji_collection
          , stored_emoji
          , stored_emoji2
          , stored_emoji3

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
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
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
                    assert.equal(body.description, 'Emoji collection ids must contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
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
                    assert.equal(body.description, 'Asset file name extension not supported.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.bad')))
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
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
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
            this.timeout(60000)
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
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should be able to clone emoji', function(done) {
            var parent_emoji_id = stored_emoji.id
              , emoji_collection_id = stored_emoji_collection.id
              , req = request(
                {
                    url: get_url('/_/api/emoji?parent_emoji_id=' + parent_emoji_id
                               + '&emoji_collection_id=' + emoji_collection_id)
                  , method: 'POST'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_emoji2 = body.emoji
                    done()
                }
            )
        })

        it('should be able to clone of a cloned emoji', function(done) {
            var parent_emoji_id = stored_emoji2.id
              , emoji_collection_id = stored_emoji_collection.id
              , req = request(
                {
                    url: get_url('/_/api/emoji?parent_emoji_id=' + parent_emoji_id
                               + '&emoji_collection_id=' + emoji_collection_id)
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_emoji3 = body.emoji
                    done()
                }
            )
        })

        it('should be able to get parent_emoji with correct saved_count', function(done) {
            var emoji_id = stored_emoji2.id
              , req = request(
                {
                    url: get_url('/_/api/emoji/' + emoji_id + '?expand=emoji.ancestor_emoji_id,emoji.ancestor_emoji_id_expanded.created_by')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.equal(body.emoji.saved_count, 1)
                    done()
                }
            )
        })

        it('should be able to get ancestor_emoji with correct saved_count', function(done) {
            var emoji_id = stored_emoji.id
              , req = request(
                {
                    url: get_url('/_/api/emoji/' + emoji_id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.equal(body.emoji.saved_count, 2)
                    done()
                }
            )
        })

        it.skip('should only allow create if user owns it')
    })

    describe.skip('put', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
          , stored_emoji_collection2
          , stored_jar = request.jar()
          , stored_account

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
                    url: get_url('/_/api/emoji/' + uuid.v4())
                  , method: 'PUT'
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should not allow upload of emoji if no id', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/emoji/' + uuid.v4())
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Emoji ids must contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should not allow upload of emoji if no emoji_collection_id', function(done) {
            var emoji_id = uuid.v4()
            var req = request(
                {
                    url: get_url('/_/api/emoji/' + emoji_id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Emoji collection created by ids must contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', emoji_id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should not allow upload of emoji if extension not valid', function(done) {
            var emoji_id = uuid.v4()
              , emoji_collection_id = uuid.v4()

            var req = request(
                {
                    url: get_url('/_/api/emoji/' + emoji_id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Asset file name extension not supported.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', emoji_id)
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', emoji_collection_id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.bad')))
        })

        it('should not allow upload of emoji if emoji_collection_id does not exist', function(done) {
            var emoji_id = uuid.v4()
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
            form.append('id', emoji_id)
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
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
            this.timeout(60000)

            var id = uuid.v4()
              , display_name = 'Super emoji'
              , tags = ['cats', 'dogs']

            var req = request(
                {
                    url: get_url('/_/api/emoji/' + id)
                  , method: 'PUT'
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
                    stored_emoji = body.emoji
                    done()
                }
            )

            var form = req.form()
            form.append('id', id)
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', stored_emoji_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should not update emoji if different user logged in', function(done) {
            var username = Math.floor(Math.random() * 1000000000)
              , password = 'password'
              , email = uuid.v4().substring(0, 15) + '@b.com'
              , now = (new Date).toISOString()
              , stored_jar2 = request.jar()

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
                    var id = uuid.v4()
                      , display_name = 'Super emoji'
                      , tags = ['cats', 'dogs']

                    var req = request(
                        {
                            url: get_url('/_/api/emoji/' + id)
                          , method: 'PUT'
                          , jar: stored_jar2
                        }
                      , function(e, d, body) {
                            body = JSON.parse(body)
                            assert.equal(d.statusCode, 404)
                            done()
                        }
                    )

                    var form = req.form()
                    form.append('id', id)
                    form.append('created_by', stored_account.id)
                    form.append('emoji_collection_id', stored_emoji_collection.id)
                    form.append('display_name', display_name)
                    form.append('tags[]', tags[0])
                    form.append('tags[]', tags[1])
                    form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
            })
        })

        it('should update emoji if no conflict', function(done) {
            this.timeout(60000)
            var display_name = 'Updated Emoji'
            var req = request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.equal(body.emoji.id, stored_emoji.id)
                    assert.equal(body.emoji.display_name, display_name)
                    assert.equal(body.emoji.created_at, stored_emoji.created_at)
                    assert.notEqual(body.emoji.updated_at, stored_emoji.updated_at)
                    assert.notEqual(body.emoji.created_at, body.emoji.updated_at)

                    stored_emoji2 = body.emoji
                    done()
            })

            var form = req.form()
                form.append('id', stored_emoji.id)
                form.append('created_at', stored_emoji.created_at)
                form.append('updated_at', stored_emoji.updated_at)
                form.append('created_by', stored_account.id)
                form.append('emoji_collection_id', stored_emoji_collection.id)
                form.append('display_name', display_name)
                form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should not update emoji if conflict, but dont return error', function(done) {
            this.timeout(60000)
            var display_name = 'Updated Again Emoji'
            var req = request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.equal(body.emoji.id, stored_emoji2.id)
                    assert.equal(body.emoji.display_name, stored_emoji2.display_name)
                    assert.equal(body.emoji.created_at, stored_emoji2.created_at)
                    assert.equal(body.emoji.updated_at, stored_emoji2.updated_at)
                    done()
            })

            var form = req.form()
                form.append('id', stored_emoji.id)
                form.append('created_at', stored_emoji.created_at)
                form.append('updated_at', stored_emoji.updated_at)
                form.append('created_by', stored_account.id)
                form.append('emoji_collection_id', stored_emoji_collection.id)
                form.append('display_name', display_name)
                form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
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

        it('should not update emoji if already deleted', function(done) {
            var display_name = 'Updated Again Emoji Collection'
            var req = request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var body = JSON.parse(body)
                    assert.equal(d.statusCode, 409)
                    done()
            })

            var form = req.form()
                form.append('id', stored_emoji2.id)
                form.append('created_at', stored_emoji2.created_at)
                form.append('updated_at', stored_emoji2.updated_at)
                form.append('created_by', stored_account.id)
                form.append('emoji_collection_id', stored_emoji_collection.id)
                form.append('display_name', display_name)
                form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })
    })

    describe('get', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
          , stored_emoji
          , stored_account
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
                    stored_account = body.account
                    done()
            })
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
                    stored_emoji_collection = body.emoji_collection
                    done()
            })
        })

        it('should create emoji', function(done) {
            this.timeout(60000)
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
            form.append('scopes[]', 'public_read')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should get 404 if emoji does not exist', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + uuid.v4())
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })

        it('should get emoji ', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id + '?expand=emoji.ancestor_emoji_id,emoji.ancestor_emoji_id_expanded.created_by')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.deepEqual(body.emoji, stored_emoji)
                    done()
            })
        })

        it('should get emoji even if not logged in when public_read is set', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'GET'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.deepEqual(body.emoji, stored_emoji)
                    done()
            })
        })

        it('should create emoji with no scopes', function(done) {
            this.timeout(60000)
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
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should get emoji if creator even without scope', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji)
                    assert.deepEqual(body.emoji, stored_emoji)
                    done()
            })
        })

        it('should not get emoji if not logged in when public_read is not set', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji.id)
                  , method: 'GET'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })
    })

    describe('list', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
          , stored_emoji_collection2
          , stored_emoji
          , stored_emoji2
          , stored_emoji3
          , stored_account
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
                    stored_account = body.account
                    done()
            })
        })

        it('should get empty emojis if no emojis', function(done) {
            request({
                    url: get_url('/_/api/emoji')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.lengthOf(body.emojis, 0)
                    done()
            })
        })

        it('should create emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'First collection'
                      , tags: ['cats', 'dogs']
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

        it('should create another emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Second collection'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection.id)
                    stored_emoji_collection2 = body.emoji_collection
                    done()
            })
        })

        it('should create emoji in first collection', function(done) {
            this.timeout(60000)
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
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should create another emoji in first collection', function(done) {
            this.timeout(60000)
            var display_name = 'Super emoji 2'
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
                    stored_emoji2 = body.emoji
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
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should create emoji in second collection', function(done) {
            this.timeout(60000)
            var display_name = 'Super emoji 3'
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
                    stored_emoji3 = body.emoji
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('emoji_collection_id', stored_emoji_collection2.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../asset/panda-dog.jpg')))
        })

        it('should get three emojis if no filter', function(done) {
            request({
                    url: get_url('/_/api/emoji')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.lengthOf(body.emojis, 3)

                    var emoji_ids = body.emojis.map(function(emoji) { return emoji.id })
                      , unique_emoji_ids = _.unique(emoji_ids).sort()
                      , expected_emoji_ids = [stored_emoji.id, stored_emoji2.id, stored_emoji3.id].sort()

                    assert.deepEqual(unique_emoji_ids, expected_emoji_ids)
                    done()
            })
        })

        it('should get two emojis if filter by first collection', function(done) {
            request({
                    url: get_url('/_/api/emoji?emoji_collection_id=' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.lengthOf(body.emojis, 2)

                    var emoji_ids = body.emojis.map(function(emoji) { return emoji.id })
                      , unique_emoji_ids = _.unique(emoji_ids).sort()
                      , expected_emoji_ids = [stored_emoji.id, stored_emoji2.id].sort()

                    assert.deepEqual(unique_emoji_ids, expected_emoji_ids)
                    done()
            })
        })

        it('should delete emoji', function(done) {
            request({
                    url: get_url('/_/api/emoji/' + stored_emoji2.id)
                  , method: 'DELETE'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should get one emoji collection in array', function(done) {
            request({
                    url: get_url('/_/api/emoji?emoji_collection_id=' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.lengthOf(body.emojis, 1)

                    var emoji_ids = body.emojis.map(function(emoji) { return emoji.id })
                      , unique_emoji_ids = _.unique(emoji_ids).sort()
                      , expected_emoji_ids = [stored_emoji.id]

                    assert.deepEqual(unique_emoji_ids, expected_emoji_ids)
                    done()
            })
        })
    })
})