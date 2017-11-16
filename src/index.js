var esprima = require('esprima')
var generate = require('./generate')
var print = require('./print')

var source = [
    'function foo() {}'
].join('\n')

var tree = esprima.parse(source)
var python = generate(tree)

print()
print(source)
print()
print(python)