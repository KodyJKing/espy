var print = require('./print')
var ionstringify = require('./ionstringify')

function generate(ast) {
    let parts = []
    let indent = 0
    let part = (str) => { parts.push(str) }
    let dent = () => { for (let i = 0; i < indent; i++) part(' ') }
    let seperator = (sep) => { let i = 0; return () => { if (i++ > 0) part(sep) } }

    let generators = {
        "Program": (node) => {
            let separate = seperator('\n')
            for (let expression of node.body) {
                separate()
                dent()
                gen(expression)
            }
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
        "VariableDeclaration": (node) => {
            let separate = seperator(', ')
            for (let declaration of node.declarations) { separate(); part(declaration.id.name) }
            part(' = ')
            separate = seperator(', ')
            for (let declaration of node.declarations) { separate(); gen(declaration.init)}
        },
        "FunctionExpression": (node) => {
            print(node)

        },
        "FunctionDeclaration": (node) => {
            print(node)
            part(node.id.name + '(')
            let separate = seperator(', ')
            for (let param of node.params) { separate(); part(param.name) }
            part(')')
            part(':')
            indent += 2
            separate = seperator('\n')
            for (let line of node.body.body) {
                separate()
                dent()
                gen(line)
            }
        },
        "BinaryExpression": (node) => { gen(node.left); part(' ' + node.operator + ' '); gen(node.right) },
        "ExpressionStatement": (node) => { gen(node.expression) },
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