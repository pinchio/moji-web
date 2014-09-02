var config = require('./config')
  , port = config.get('server').port
  , host = '0.0.0.0'
  , server = require('src/server/server/Server').get_instance()

server.listen(port, host)
