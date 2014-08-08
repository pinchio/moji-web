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

var get_conn_string = function(config) {
    return [
        'postgres://', config.get('db.user'), ':', config.get('db.pass')
      , '@', config.get('db.host'), ':', config.get('db.port'), '/', config.get('db.name')
    ].join('')
}

config.loadFile(path.join(__dirname, config.get('env') + '.json'))

if (config.get('override_env')) {
    config.loadFile(path.join(__dirname, config.get('override_env') + '.json'))
}

config.set('conn_string', get_conn_string(config))

config.validate()

module.exports = config
