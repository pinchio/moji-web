var server = require('src/server/server/Server').get_instance()
  , config = require('config')
  , port = config.get('server').port
  , host = '0.0.0.0'

// TODO: if no process.env set do not pass go.

console.log('hihi')

server.listen(port, host)
