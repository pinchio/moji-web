var convict = require('convict')
  , path = require('path')

// Never use `arg`.
// `env` takes precendence over json config files.
var config = convict({
    'env': {
        'doc': 'The application environment'
      , 'format': ['production', 'staging', 'development', 'test']
      , 'default': 'development'
      , 'env': 'NODE_ENV'
      , 'arg': 'env'
    }
  , 'override_env': {
        'doc': 'Overwriting the environment'
      , 'format': '*'
      , 'default': null
      , 'env': 'NODE_OVERRIDE'
      , 'arg': 'override'
    }
  , 'path': {
        'doc': 'path'
      , 'format': function(value) {
            if (!value || !value.length || value.length < 1) {
                throw new Error('Must supply env variable NODE_PATH.')
            }
        }
      , 'default': ''
      , 'env': 'NODE_PATH'
      , 'arg': 'path'
    }
  , 'project_path': {
        'doc': 'Project path'
      , 'format': '*'
      , 'default': './'
      , 'env': 'NODE_PROJECT_PATH'
      , 'arg': 'project_path'
    }
 , 'server': {
        'port': {
            'format': '*'
          , 'default': '10000'
          , 'env': 'NODE_PORT'
        }
      , 'host': {
            'format': '*'
          , 'default': '0.0.0.0'
          , 'env': 'NODE_HOST'
        }
    }
 , 'aws': {
        'aws_access_key_id': {
            'format': function(value) {
                if (!value || !value.length || value.length < 10) {
                    throw new Error('Must supply env variable AWS_ACCESS_KEY_ID.')
                }
            }
          , 'default': ''
          , 'env': 'AWS_ACCESS_KEY_ID'
        }
      , 'aws_secret_access_key': {
            'format': function(value) {
                if (!value || !value.length || value.length < 10) {
                    throw new Error('Must supply env variable AWS_SECRET_ACCESS_KEY.')
                }
            }
          , 'default': ''
          , 'env': 'AWS_SECRET_ACCESS_KEY'
        }
    }
 , 'fb': {
        'client_id': {
            'format': function(value) {
                if (!value || !value.length || value.length < 10) {
                    throw new Error('Must supply env variable FB_CLIENT_ID.')
                }
            }
          , 'default': ''
          , 'env': 'FB_CLIENT_ID'
        }
      , 'client_secret': {
            'format': function(value) {
                if (!value || !value.length || value.length < 10) {
                    throw new Error('Must supply env variable FB_CLIENT_SECRET.')
                }
            }
          , 'default': ''
          , 'env': 'FB_CLIENT_SECRET'
        }
    }
 , 's3': {
        'bucket': {
            'format': '*'
          , 'default': 'mojigram-uploads-development'
          , 'env': 'AWS_S3_BUCKET'
        }
      , 'base_url': {
            'format': '*'
          , 'default': 'mojigram-uploads-development'
          , 'env': 'AWS_S3_BASE_URL'
        }
    }
  , 'db': {
        'host': {
            'format': '*'
          , 'default': ''
          , 'env': 'PSQL_DB_HOST'
        }
      , 'port': {
            'format': '*'
          , 'default': '5432'
          , 'env': 'PSQL_DB_PORT'
        }
      , 'name': {
            'format': '*'
          , 'default': ''
          , 'env': 'PSQL_DB_NAME'
        }
      , 'user': {
            'format': '*'
          , 'default': ''
          , 'env': 'PSQL_DB_USER'
        }
      , 'pass': {
            'format': '*'
          , 'default': ''
          , 'env': 'PSQL_DB_PASS'
        }
    }
})

config.validate()

config.loadFile(path.join(__dirname, config.get('env') + '.json'))

if (process.env.NODE_ENV === 'development' && !config.get('override_env')) {
    console.log('Please set the `NODE_OVERRIDE` env variable to your config override file name excluding .json.')
    process.exit()
}

if (config.get('override_env')) {
    config.loadFile(path.join(__dirname, config.get('override_env') + '.json'))
}

config.validate()

var get_conn_string = function(config) {
    return [
        'postgres://', config.get('db.user'), ':', config.get('db.pass')
      , '@', config.get('db.host'), ':', config.get('db.port'), '/', config.get('db.name')
    ].join('')
}

config.set('conn_string', get_conn_string(config))

module.exports = config
