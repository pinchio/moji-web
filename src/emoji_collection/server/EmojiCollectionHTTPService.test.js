var assert = require('chai').assert
  , fs = require('fs')
  , server = require('src/server').Server.get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'
  , request = require('request')
  , path = require('path')

var get_url = function(args) {
    return 'http://localhost:' + port + path.join.apply(path, Array.prototype.slice.call(arguments))
}

describe('EmojiCollectionHTTPService', function() {
    describe('post', function() {
       var username = 'ab' + Date.now()
          , password = 'password'
          , email = 'a' + Date.now() + '@b.com'
          , stored_account
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

        it('should not create emoji collection if display_name has special characters', function(done) {
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
})
