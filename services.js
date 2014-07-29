var config = require('./config')
  , _ = require('underscore')
  , path = require('path')
  , fs = require('fs')

var services = {
    webserver: {
        name: 'www.mojigram.com'
      , script: './server.js'
      , instances: 1
      , env: {
            NODE_PORT: 10000
          , NODE_ENV: config.get('env')
          , NODE_PATH: config.get('project_path')
        }
    }
}

var get_pm2_start_command = function(service) {
    var command = ''

    _(service.env).forEach(function(v, k) {
        command += k + '=' + v + ' '
    })

    command += 'pm2 start ' + service.script

    if (service.name) {
        command += ' --name ' + service.name
    }

    if (service.instances) {
        command += ' --instances ' + service.instances
    }

    if (service.args) {
        command += ' --'
        _(service.args).forEach(function(v, k) {
            command += ' ' + k + '=' + v
        })
    }

    return command
}

var commands = []
_(services).forEach(function(service) {
    commands.push(get_pm2_start_command(service))
})

commands = commands.join('\n')

console.log(commands)

module.exports = services
