var server = require('src/server/server/Server').get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'

if (!process.env.NODE_ENV) {
    process.exit('Please set the `NODE_ENV` env variable.')
} else if (process.env.NODE_ENV === 'development' && !process.env.NODE_OVERRIDE) {
    process.exit('Please set the `NODE_OVERRIDE` env variable to your config override file name excluding .json.')
} else if (!process.env.NODE_PATH) {
    process.exit('Please set the `NODE_PATH` env variable.')
}

server.listen(port, host)
