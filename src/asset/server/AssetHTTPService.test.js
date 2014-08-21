var assert = require('chai').assert
  , _ = require('underscore')
  , fs = require('fs')
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , host = config.get('server').host
  , port = config.get('server').port
  , request = require('request')
  , path = require('path')
  , uuid = require('node-uuid')

var get_url = function(args) {
    return 'http://' + host + ':' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe.skip('AssetHTTPService', function() {
    describe('post', function() {
        var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
          , stored_account
          , stored_jar
          , stored_image_collection

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

        it('should not allow upload of image if no session', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/image')
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

        it('should not allow upload of image if no image_collection_id', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Asset collection ids contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not allow upload of image if extension not valid', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/image')
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
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.bad')))
        })

        it('should not allow upload of image if image_collection_id does not exist', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Invalid image collection id.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should create image collection', function(done) {
            request({
                    url: get_url('/_/api/image_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image_collection.id)
                    stored_image_collection = body.image_collection
                    done()
            })
        })

        it('should create image', function(done) {
            this.timeout(10000)
            var display_name = 'Super image'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.isDefined(body.image.id)
                    assert.isDefined(body.image.created_at)
                    assert.isDefined(body.image.updated_at)
                    assert.equal(body.image.deleted_at, null)
                    assert.equal(body.image.display_name, display_name)
                    assert.equal(body.image.tags[0], tags[0])
                    assert.equal(body.image.tags[1], tags[1])
                    assert.equal(body.image.created_by, stored_account.id)
                    assert.isDefined(body.image.asset_url)
                    assert.equal(body.image.image_collection_id, stored_image_collection.id)
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it.skip('should only allow create if user owns it')
    })

    describe('put', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_image_collection
          , stored_image_collection2
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

        it('should not allow upload of image if no session', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/image/' + uuid.v4())
                  , method: 'PUT'
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not allow upload of image if no id', function(done) {
            var req = request(
                {
                    url: get_url('/_/api/image/' + uuid.v4())
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Asset ids contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not allow upload of image if no image_collection_id', function(done) {
            var image_id = uuid.v4()
            var req = request(
                {
                    url: get_url('/_/api/image/' + image_id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Asset collection created by ids contain more than 10 characters.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', image_id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not allow upload of image if extension not valid', function(done) {
            var image_id = uuid.v4()
              , image_collection_id = uuid.v4()

            var req = request(
                {
                    url: get_url('/_/api/image/' + image_id)
                  , method: 'PUT'
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
            form.append('id', image_id)
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', image_collection_id)
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.bad')))
        })

        it('should not allow upload of image if image_collection_id does not exist', function(done) {
            var image_id = uuid.v4()
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Invalid image collection id.')
                    done()
                }
            )

            var form = req.form()
            form.append('id', image_id)
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', 'some_id_not_exist')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should create image collection', function(done) {
            request({
                    url: get_url('/_/api/image_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image_collection.id)
                    stored_image_collection = body.image_collection
                    done()
            })
        })

        it('should create image', function(done) {
            this.timeout(10000)

            var id = uuid.v4()
              , display_name = 'Super image'
              , tags = ['cats', 'dogs']

            var req = request(
                {
                    url: get_url('/_/api/image/' + id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.isDefined(body.image.id)
                    assert.isDefined(body.image.created_at)
                    assert.isDefined(body.image.updated_at)
                    assert.equal(body.image.deleted_at, null)
                    assert.equal(body.image.display_name, display_name)
                    assert.equal(body.image.tags[0], tags[0])
                    assert.equal(body.image.tags[1], tags[1])
                    assert.equal(body.image.created_by, stored_account.id)
                    assert.isDefined(body.image.asset_url)
                    assert.equal(body.image.image_collection_id, stored_image_collection.id)
                    stored_image = body.image
                    done()
                }
            )

            var form = req.form()
            form.append('id', id)
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not update image if different user logged in', function(done) {
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
                      , display_name = 'Super image'
                      , tags = ['cats', 'dogs']

                    var req = request(
                        {
                            url: get_url('/_/api/image/' + id)
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
                    form.append('image_collection_id', stored_image_collection.id)
                    form.append('display_name', display_name)
                    form.append('tags[]', tags[0])
                    form.append('tags[]', tags[1])
                    form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
            })
        })

        it('should update image if no conflict', function(done) {
            this.timeout(10000)
            var display_name = 'Updated Asset'
            var req = request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.equal(body.image.id, stored_image.id)
                    assert.equal(body.image.display_name, display_name)
                    assert.equal(body.image.created_at, stored_image.created_at)
                    assert.notEqual(body.image.updated_at, stored_image.updated_at)
                    assert.notEqual(body.image.created_at, body.image.updated_at)

                    stored_image2 = body.image
                    done()
            })

            var form = req.form()
                form.append('id', stored_image.id)
                form.append('created_at', stored_image.created_at)
                form.append('updated_at', stored_image.updated_at)
                form.append('created_by', stored_account.id)
                form.append('image_collection_id', stored_image_collection.id)
                form.append('display_name', display_name)
                form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should not update image if conflict, but dont return error', function(done) {
            this.timeout(10000)
            var display_name = 'Updated Again Asset'
            var req = request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.equal(body.image.id, stored_image2.id)
                    assert.equal(body.image.display_name, stored_image2.display_name)
                    assert.equal(body.image.created_at, stored_image2.created_at)
                    assert.equal(body.image.updated_at, stored_image2.updated_at)
                    done()
            })

            var form = req.form()
                form.append('id', stored_image.id)
                form.append('created_at', stored_image.created_at)
                form.append('updated_at', stored_image.updated_at)
                form.append('created_by', stored_account.id)
                form.append('image_collection_id', stored_image_collection.id)
                form.append('display_name', display_name)
                form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should delete image', function(done) {
            request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'DELETE'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should not update image if already deleted', function(done) {
            var display_name = 'Updated Again Asset Collection'
            var req = request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'PUT'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    var body = JSON.parse(body)
                    assert.equal(d.statusCode, 409)
                    done()
            })

            var form = req.form()
                form.append('id', stored_image2.id)
                form.append('created_at', stored_image2.created_at)
                form.append('updated_at', stored_image2.updated_at)
                form.append('created_by', stored_account.id)
                form.append('image_collection_id', stored_image_collection.id)
                form.append('display_name', display_name)
                form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })
    })

    describe('get', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_image_collection
          , stored_image
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

        it('should create image collection', function(done) {
            request({
                    url: get_url('/_/api/image_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_image_collection = body.image_collection
                    done()
            })
        })

        it('should create image', function(done) {
            this.timeout(10000)
            var display_name = 'Super image'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    stored_image = body.image
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('scopes[]', 'public_read')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should get 404 if image does not exist', function(done) {
            request({
                    url: get_url('/_/api/image/' + uuid.v4())
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })

        it('should get image ', function(done) {
            request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.deepEqual(body.image, stored_image)
                    done()
            })
        })

        it('should get image even if not logged in when public_read is set', function(done) {
            request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'GET'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.deepEqual(body.image, stored_image)
                    done()
            })
        })

        it('should create image with no scopes', function(done) {
            var display_name = 'Super image'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    stored_image = body.image
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should get image if creator even without scope', function(done) {
            request({
                    url: get_url('/_/api/image/' + stored_image.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.image)
                    assert.deepEqual(body.image, stored_image)
                    done()
            })
        })

        it('should not get image if not logged in when public_read is not set', function(done) {
            request({
                    url: get_url('/_/api/image/' + stored_image.id)
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
          , stored_image_collection
          , stored_image_collection2
          , stored_image
          , stored_image2
          , stored_image3
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

        it('should get empty images if no images', function(done) {
            request({
                    url: get_url('/_/api/image')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.images)
                    assert.lengthOf(body.images, 0)
                    done()
            })
        })

        it('should create image collection', function(done) {
            request({
                    url: get_url('/_/api/image_collection')
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
                    assert.isDefined(body.image_collection.id)
                    stored_image_collection = body.image_collection
                    done()
            })
        })

        it('should create another image collection', function(done) {
            request({
                    url: get_url('/_/api/image_collection')
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
                    assert.isDefined(body.image_collection.id)
                    stored_image_collection2 = body.image_collection
                    done()
            })
        })

        it('should create image in first collection', function(done) {
            this.timeout(10000)
            var display_name = 'Super image'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    stored_image = body.image
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should create another image in first collection', function(done) {
            this.timeout(10000)
            var display_name = 'Super image 2'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    stored_image2 = body.image
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should create image in second collection', function(done) {
            this.timeout(10000)
            var display_name = 'Super image 3'
              , tags = ['cats', 'dogs']
            var req = request(
                {
                    url: get_url('/_/api/image')
                  , method: 'POST'
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    body = JSON.parse(body)
                    assert.equal(d.statusCode, 200)
                    stored_image3 = body.image
                    done()
                }
            )

            var form = req.form()
            form.append('id', uuid.v4())
            form.append('created_by', stored_account.id)
            form.append('image_collection_id', stored_image_collection2.id)
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('asset', fs.createReadStream(path.join(__dirname, '../panda-dog.jpg')))
        })

        it('should get three images if no filter', function(done) {
            request({
                    url: get_url('/_/api/image')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.images)
                    assert.lengthOf(body.images, 3)

                    var image_ids = body.images.map(function(image) { return image.id })
                      , unique_image_ids = _.unique(image_ids).sort()
                      , expected_image_ids = [stored_image.id, stored_image2.id, stored_image3.id].sort()

                    assert.deepEqual(unique_image_ids, expected_image_ids)
                    done()
            })
        })

        it('should get two images if filter by first collection', function(done) {
            request({
                    url: get_url('/_/api/image?image_collection_id=' + stored_image_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.images)
                    assert.lengthOf(body.images, 2)

                    var image_ids = body.images.map(function(image) { return image.id })
                      , unique_image_ids = _.unique(image_ids).sort()
                      , expected_image_ids = [stored_image.id, stored_image2.id].sort()

                    assert.deepEqual(unique_image_ids, expected_image_ids)
                    done()
            })
        })

        it('should delete image', function(done) {
            request({
                    url: get_url('/_/api/image/' + stored_image2.id)
                  , method: 'DELETE'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    done()
            })
        })

        it('should get one image collection in array', function(done) {
            request({
                    url: get_url('/_/api/image?image_collection_id=' + stored_image_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.images)
                    assert.lengthOf(body.images, 1)

                    var image_ids = body.images.map(function(image) { return image.id })
                      , unique_image_ids = _.unique(image_ids).sort()
                      , expected_image_ids = [stored_image.id]

                    assert.deepEqual(unique_image_ids, expected_image_ids)
                    done()
            })
        })
    })
})
