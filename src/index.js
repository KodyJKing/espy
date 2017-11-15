var esprima = require('esprima')
var generate = require('./generate')
var print = require('./print')

var source = 'console["log"]("Hello World")'
var tree = esprima.parse(source)
var python = generate(tree)
// print(tree)
// print()
print(python)