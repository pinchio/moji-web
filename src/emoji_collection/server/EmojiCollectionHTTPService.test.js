var assert = require('chai').assert
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

describe('EmojiCollectionHTTPService', function() {
    describe('post', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
          , stored_jar = request.jar()

        it('should not create emoji collection if not logged in', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Awesome Emoji Collection'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    done()
            })
        })

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
                    done()
            })
        })

        it('should not create emoji collection if display_name is too long', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: new Array(130).join('a')
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Display name must be less than 129 characters.')
                    done()
            })
        })

        it.skip('should not create emoji collection if display_name has special characters', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'abc#*'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Display name can only contain letters, numbers and standard punctuation.')
                    done()
            })
        })

        it('should create emoji collection if display_name is empty', function(done) {
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
                    done()
            })
        })

        it('should create emoji collection with extra_data background_color_*', function(done) {
            var extra_data = {
                background_color_light: '123'
              , background_color_dark: '245'
            }

            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                      , extra_data: extra_data
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection.id)
                    assert.deepEqual(body.emoji_collection.extra_data, extra_data)
                    done()
            })
        })

        it('should not create emoji collection with garbage extra_data', function(done) {
            var extra_data = {
                garbage: true
            }

            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                      , extra_data: extra_data
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Extra_data garbage is not allowed.')
                    done()
            })
        })

        it('should create emoji collection if display_name has normal punctuation', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'abc123-_ ,.;:()'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection.id)
                    done()
            })
        })

        it('should create emoji collection if tags is empty', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Awesome collection'
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection.id)
                    done()
            })
        })

        it('should not create emoji collection if tags contain special characters', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Awesome collection'
                      , tags: ['__tag']
                      , scopes: ['public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Tags can only contain letters and numbers.')
                    done()
            })
        })

        it('should not create emoji collection if scopes contain something other than public_read', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Awesome collection'
                      , tags: ['cats']
                      , scopes: ['public_write']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    assert.equal(body.description, 'Invalid scope.')
                    done()
            })
        })

        it('should create emoji collection if scopes contain public_write and dedupe', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Awesome collection'
                      , scopes: ['public_read', 'public_read']
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection.id)
                    assert.lengthOf(body.emoji_collection.scopes, 1)
                    assert.equal(body.emoji_collection.scopes[0], 'public_read')
                    done()
            })
        })
    })

    describe('get', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
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
                    done()
            })
        })

        it('should create emoji collection if display_name is empty', function(done) {
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

        it('should get emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.deepEqual(body.emoji_collection, stored_emoji_collection)
                    done()
            })
        })

        it('should get 404 if emoji collection does not exist', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + uuid.v4())
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })

        it('should get emoji collection even if not logged in when public_read is set', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.deepEqual(body.emoji_collection, stored_emoji_collection)
                    done()
            })
        })

        it('should create emoji collection with no scopes', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        tags: ['cats', 'dogs']
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

        it('should get emoji collection if creator even without scope', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.deepEqual(body.emoji_collection, stored_emoji_collection)
                    done()
            })
        })

        it('should not get emoji collection if not logged in when public_read is not set', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
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
                    done()
            })
        })

        it('should get empty emoji collection if no emoji collections', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.lengthOf(body.emoji_collections, 0)
                    done()
            })
        })

        it('should create emoji collection if display_name is empty', function(done) {
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

        it('should get one emoji collection in array', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.lengthOf(body.emoji_collections, 1)
                    done()
            })
        })

        it('should create emoji collection if display_name is empty', function(done) {
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

        it('should get two emoji collection in array', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.lengthOf(body.emoji_collections, 2)
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

        it('should get one emoji collection in array', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.lengthOf(body.emoji_collections, 1)
                    done()
            })
        })

        it('should create emoji collection if it is private', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        display_name: 'Second collection'
                      , tags: ['cats', 'dogs']
                      , scopes: []
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

        it('should get two emoji collection in array', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.lengthOf(body.emoji_collections, 2)
                    done()
            })
        })
    })

    describe('put', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
          , stored_emoji_collection2
          , stored_jar = request.jar()
          , stored_account

        it('should not create emoji collection if not logged in', function(done) {
            var id = uuid.v4()
              , now = (new Date).toISOString()

            request({
                    url: get_url('/_/api/emoji_collection/' + id)
                  , method: 'PUT'
                  , json: {
                        id: id
                      , created_at: now
                      , updated_at: now
                      , display_name: 'Awesome Emoji Collection'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                      , created_by: 'abcdefg'
                    }
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    assert.equal(body.description, 'Authentication required.')
                    done()
            })
        })

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

        it('should create emoji collection if id is generated client side', function(done) {
            var id = uuid.v4()
              , now = (new Date).toISOString()

            request({
                    url: get_url('/_/api/emoji_collection/' + id)
                  , method: 'PUT'
                  , json: {
                        id: id
                      , created_at: now
                      , updated_at: now
                      , display_name: 'Awesome Emoji Collection'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                      , created_by: stored_account.id
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.equal(body.emoji_collection.id, id)
                    assert.notEqual(body.emoji_collection.created_at, now)
                    assert.notEqual(body.emoji_collection.updated_at, now)
                    assert.equal(body.emoji_collection.created_at, body.emoji_collection.updated_at)

                    stored_emoji_collection = body.emoji_collection
                    done()
            })
        })

        it('should not create emoji collection if id is not provided', function(done) {
            var id = uuid.v4()
              , now = (new Date).toISOString()

            request({
                    url: get_url('/_/api/emoji_collection/' + id)
                  , method: 'PUT'
                  , json: {
                        created_at: now
                      , updated_at: now
                      , display_name: 'Awesome Emoji Collection'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                      , created_by: stored_account.id
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 400)
                    done()
            })
        })

        it('should not update emoji collection if different user logged in', function(done) {
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
                    request({
                            url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                          , method: 'PUT'
                          , json: {
                                id: stored_emoji_collection.id
                              , created_at: now
                              , updated_at: now
                              , display_name: 'Awesome Emoji Collection'
                              , tags: ['cats', 'dogs']
                              , scopes: ['public_read']
                              , created_by: stored_account.id
                            }
                          , jar: stored_jar2
                        }
                      , function(e, d, body) {
                            assert.equal(d.statusCode, 404)
                            done()
                    })
            })
        })

        it('should not update emoji collection if different user logged in 2', function(done) {
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
                    request({
                            url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                          , method: 'PUT'
                          , json: {
                                id: stored_emoji_collection.id
                              , created_at: now
                              , updated_at: now
                              , display_name: 'Awesome Emoji Collection'
                              , tags: ['cats', 'dogs']
                              , scopes: ['public_read']
                              , created_by: body.account.id
                            }
                          , jar: stored_jar2
                        }
                      , function(e, d, body) {
                            assert.equal(d.statusCode, 404)
                            done()
                    })
            })
        })

        it('should update emoji collection if no conflict', function(done) {
            var display_name = 'Updated Emoji Collection'
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'PUT'
                  , json: {
                        id: stored_emoji_collection.id
                      , created_at: stored_emoji_collection.created_at
                      , updated_at: stored_emoji_collection.updated_at
                      , display_name: display_name
                      , tags: stored_emoji_collection.tags
                      , scopes: stored_emoji_collection.scopes
                      , created_by: stored_emoji_collection.created_by
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.equal(body.emoji_collection.id, stored_emoji_collection.id)
                    assert.equal(body.emoji_collection.display_name, display_name)
                    assert.equal(body.emoji_collection.created_at, stored_emoji_collection.created_at)
                    assert.notEqual(body.emoji_collection.updated_at, stored_emoji_collection.updated_at)
                    assert.notEqual(body.emoji_collection.created_at, body.emoji_collection.updated_at)

                    stored_emoji_collection2 = body.emoji_collection
                    done()
            })
        })

        it('should not update emoji collection if conflict, but dont return error', function(done) {
            var display_name = 'Updated Again Emoji Collection'
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'PUT'
                  , json: {
                        id: stored_emoji_collection.id
                      , created_at: stored_emoji_collection.created_at
                      , updated_at: stored_emoji_collection.updated_at
                      , display_name: display_name
                      , tags: stored_emoji_collection.tags
                      , scopes: stored_emoji_collection.scopes
                      , created_by: stored_emoji_collection.created_by
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.equal(body.emoji_collection.id, stored_emoji_collection.id)
                    assert.equal(body.emoji_collection.display_name, stored_emoji_collection2.display_name)
                    assert.equal(body.emoji_collection.created_at, stored_emoji_collection2.created_at)
                    assert.equal(body.emoji_collection.updated_at, stored_emoji_collection2.updated_at)
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

        it('should not update emoji collection if already deleted', function(done) {
            var display_name = 'Updated Again Emoji Collection'
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection2.id)
                  , method: 'PUT'
                  , json: {
                        id: stored_emoji_collection2.id
                      , created_at: stored_emoji_collection2.created_at
                      , updated_at: stored_emoji_collection2.updated_at
                      , display_name: display_name
                      , tags: stored_emoji_collection2.tags
                      , scopes: stored_emoji_collection2.scopes
                      , created_by: stored_emoji_collection2.created_by
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 409)
                    done()
            })
        })
    })

    describe('del', function() {
        var username = Math.floor(Math.random() * 1000000000)
          , password = 'password'
          , email = uuid.v4().substring(0, 15) + '@b.com'
          , stored_emoji_collection
          , stored_jar = request.jar()
          , stored_account

        it('should not delete emoji collection if not logged in', function(done) {
            var id = uuid.v4()
              , now = (new Date).toISOString()

            request({
                    url: get_url('/_/api/emoji_collection/' + id)
                  , method: 'DELETE'
                  , json: true
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 401)
                    assert.equal(body.description, 'Authentication required.')
                    done()
            })
        })

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

        it('should create emoji collection if id is generated client side', function(done) {
            var id = uuid.v4()
              , now = (new Date).toISOString()

            request({
                    url: get_url('/_/api/emoji_collection/' + id)
                  , method: 'PUT'
                  , json: {
                        id: id
                      , created_at: now
                      , updated_at: now
                      , display_name: 'Awesome Emoji Collection'
                      , tags: ['cats', 'dogs']
                      , scopes: ['public_read']
                      , created_by: stored_account.id
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.equal(body.emoji_collection.id, id)

                    stored_emoji_collection = body.emoji_collection
                    done()
            })
        })

        it('should get emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collection)
                    assert.deepEqual(body.emoji_collection, stored_emoji_collection)
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

        it('should not get deleted emoji collection', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection/' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 404)
                    done()
            })
        })

        it('should re-delete emoji collection', function(done) {
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
    })

    if (process.env.MOJIGRAM_PASSWORD) {
    describe('@mojigram user', function() {
        var password = process.env.MOJIGRAM_PASSWORD
          , stored_jar = request.jar()
          , display_name = '' + Math.floor(Math.random() * 1000000000)
          , stored_emoji_collection
          , stored_account
          , stored_emoji
          , stored_jar2
          , stored_account2

        it('should be able to login as @mojigram', function(done) {
            request(
                {
                    url: get_url('/_/api/session')
                  , method: 'POST'
                  , json: {
                        username: 'mojigram'
                      , password: password
                    }
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    stored_account = body.account
                    done()
                }
            )
        })

       it('should create emoji collection for mojigram user', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection')
                  , method: 'POST'
                  , json: {
                        tags: [display_name]
                      , display_name: 'Featured'
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

            var display_name = 'Super emoji'
              , tags = ['cats', 'dogs']
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
            form.append('display_name', display_name)
            form.append('tags[]', tags[0])
            form.append('tags[]', tags[1])
            form.append('scopes[]', 'public_read')
            form.append('asset', fs.createReadStream(path.join(__dirname, '../../emoji/panda-dog.jpg')))
        })

        it('should find emoji collection as mojigram user', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection?created_by=' + stored_account.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.isDefined(body.emoji_collections[0])
                    assert.deepEqual(body.emoji_collections[0], stored_emoji_collection)
                    done()
            })
        })

        it('should get emojis as mojigram user', function(done) {
            request({
                    url: get_url('/_/api/emoji?emoji_collection_id=' + stored_emoji_collection.id)
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

        it('should create new account', function(done) {
            var username = Math.floor(Math.random() * 1000000000)
              , password = 'password'
              , email = uuid.v4().substring(0, 15) + '@b.com'

            stored_jar2 = request.jar()

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

        it('should find emoji collection as another user', function(done) {
            request({
                    url: get_url('/_/api/emoji_collection?created_by=' + stored_account.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar2
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emoji_collections)
                    assert.isDefined(body.emoji_collections[0])
                    assert.deepEqual(body.emoji_collections[0], stored_emoji_collection)
                    done()
            })
        })

        it('should get emojis as another user', function(done) {
            request({
                    url: get_url('/_/api/emoji?emoji_collection_id=' + stored_emoji_collection.id)
                  , method: 'GET'
                  , json: true
                  , jar: stored_jar2
                }
              , function(e, d, body) {
                    assert.equal(d.statusCode, 200)
                    assert.isDefined(body.emojis)
                    assert.deepEqual(body.emojis[0], stored_emoji)
                    done()
            })
        })
    })
    }
})
