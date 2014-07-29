var server = require('src/server').Server.get_instance()
  , port = process.env.PORT || process.env.NODE_PORT || 10000
  , host = '0.0.0.0'

server.listen(port, host)
