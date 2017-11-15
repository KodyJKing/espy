var print = require('./print')
var ionstringify = require('./ionstringify')

function generate(ast) {
    let parts = []
    let depth = 0
    let part = (str) => { parts.push(str) }
    let end = () => part('\n')
    let dent = () => { for (let i = 0; i < depth; i++) part('  ') }

    let generators = {
        "Program": (node) => {
            let i = 0
            for (let expression of node.body) {
                dent()
                gen(expression)
                if (++i < node.body.length) end()
            }
        },
        "ExpressionStatement": (node) => {
            gen(node.expression)
        },
        "CallExpression": (node) => {
            gen(node.callee)
            part('(')
            for(let arg of node.arguments) gen(arg)
            part(')')
        },
        "MemberExpression": (node) => {
            gen(node.object)
            if (node.computed) {
                part('[')
                gen(node.property)
                part(']')
            } else {
                part('.')
                part(node.property.name)
            }
        },
        "Identifier": (node) => { part(node.name) },
        "Literal": (node) => { part(node.raw) },
    }

    let gen = function(node) {
        let generator = generators[node.type]
        if (!generator) {
            print(node)
            throw new Error('Unsupported node type ' + node.type)
        } else {
            generators[node.type](node)
        }
    }

    gen(ast, 0)
    return parts.join('')
}

module.exports = generate