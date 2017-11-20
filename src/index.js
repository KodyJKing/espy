var fs = require('fs')

var py = require('python-shell')

var generate = require('./generate')
var print = require('./print')
var preprocess = require('./preprocess')

var js = fs.readFileSync('test/source.js', 'utf8')
var python = generate(js)

print('\nJS', '\n' + js)
print('\nPYTHON', '\n' + python)

print('\nJS OUTPUT')
require('../test/source.js')

fs.writeFileSync('test/source.py', python, 'utf8')
py.run('test/source.py', { pythonPath: '/usr/bin/python3' }, (err, results) => {
    if (err)
        print('\nPYTHON ERROR', '\n' + err)
    if (results)
        print('\nPYTHON OUTPUT', '\n' + results.join('\n'))
})