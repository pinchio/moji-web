var server = require('src/server/server/Server').get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'

if (process.env.NODE_ENV === 'development' && !process.env.NODE_OVERRIDE) {
    process.exit('Please set the `NODE_OVERRIDE` env variable to your config override file name excluding .json.')
}

server.listen(port, host)
