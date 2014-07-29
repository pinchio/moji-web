#!/usr/bin/env node

var temp = require('temp')
  , child_process = require('child_process')
  , path = require('path')
  , fs = require('fs')

function check_err(msg, err) {
    if (err) {
        process.stderr.write('ERROR: ' + msg + ':\n\n')
        process.stderr.write(err + '\n')
        process.exit(1)
    }
}

function do_deploy() {
    temp.mkdir('deploy', function(err, new_code_dir) {
        console.log('>> staging code to', new_code_dir)

        var commands = [
                ['exporting current code', 'git archive --format=tar master | tar -x -C ' + new_code_dir]
              , ['extract current sha', 'git log -1 --oneline master > $HOME/ver.txt']
              , ['update dependencies', 'npm install --production', {cwd: new_code_dir}]
            ]
          , code_dir = path.join(process.env['HOME'], 'code');

        function runNextCommand(cb) {
            if (!commands.length) return cb()
            var cmd = commands.shift()
            console.log('>>', cmd[0])
            var c = child_process.exec(cmd[1], cmd[2] ? cmd[2] : {}, function(err, se, so) {
                check_err('while ' + cmd[0], err)
                runNextCommand(cb)
            })
            c.stdout.pipe(process.stdout)
            c.stderr.pipe(process.stderr)
        }

        function moveCode() {
            var cmd = 'rm -rf ' + code_dir + '.old'
            commands.push(['delete ancient code: ' + cmd, cmd])
            if (fs.existsSync(code_dir)) {
                var cmd = 'mv ' + code_dir + '{,.old}'
                commands.push(['move old code out of the way: ' + cmd, cmd])
            }
            var cmd = 'mv ' + new_code_dir + ' ' + code_dir
            commands.push(['move new code into place: ' + cmd, cmd])

            runNextCommand(function() {
                restart()
            })
        }

        function restart() {
            commands.push(['stopping processes', 'pm2 kill', {cwd: code_dir}])
            commands.push(['starting processes', 'NODE_ENV=production node services | sh', {cwd: code_dir}])

            runNextCommand(function() {
                allDone()
            })
        }

        function allDone() {
          console.log('>> all done')
        }

        runNextCommand(function() {
            moveCode()
        })
    })
}

do_deploy()
