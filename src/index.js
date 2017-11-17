var esprima = require('esprima')
var generate = require('./generate')
var print = require('./print')
var preprocess = require('./preprocess')

// function compare(source) {
//     let ast = esprima.parse(source)
//     print(ast)
//     print(preprocess(ast))
// }

// compare(`
//     if (true) {}
// `)

var source =
`
while (a)
    b()
`

var tree = esprima.parse(source)
var python = generate(tree)

print()
print(source)
print()
print(python)