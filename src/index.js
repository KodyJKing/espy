var esprima = require('esprima')
var generate = require('./generate')
var print = require('./print')
var preprocess = require('./preprocess')

var source =
`let a = {a: 10}
let b = a.a`

var tree = esprima.parse(source)
var python = generate(tree)

print()
print('SOURCE', '\n' + source)
print()
print('PYTHON', '\n' + python)