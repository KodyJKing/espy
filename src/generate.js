var print = require('./print')
var ionstringify = require('./ionstringify')
var preprocess = require('./preprocess')
var esprima = require('esprima')

var stdBody =
`def espyget(object, property):
    if type(object).__name__ == 'dict':
        if property in object:
            return object[property]
    return getattr(object, property)

def espyset(object, property, value):
    if type(object).__name__ == 'dict':
        object[property] = value
    else:
        setattr(object, property, value)

console = {'log': print}

`

module.exports = function (ast) {
    if (typeof ast == 'string')
        ast = esprima.parse(ast)
    print('\nAST', ast)
    ast = preprocess(ast)
    print('\nPROCESSED AST', ast)

    let parts = []
    let indentLevel = -1
    let part = (str) => { parts.push(str) }
    let dent = () => { for (let i = 0; i < indentLevel; i++) part('    ') }
    let indent = () => { indentLevel-- }
    let outdent = () => { indentLevel++ }
    let seperator = (sep) => { let i = 0; return () => { if (i++ > 0) part(sep) } }

    let generate = function (node) {
        if (!node) return
        let type = node.type
        let generator = generators[type]
        if (!generator) {
            print('\nERROR ON', node)
            throw new Error('Unsupported node type ' + type)
        } else {
            generators[type](node)
        }
    }

    let generators = {
        Program: (node) => {
            let separate = seperator('\n')
            for (let expression of node.body) {
                separate()
                dent()
                generate(expression)
            }
        },
        CallExpression: (node) => {
            generate(node.callee)
            part('(')
            for(let arg of node.arguments) generate(arg)
            part(')')
        },
        MemberExpression: (node) => {
            part('espyget( ')
            generate(node.object)
            part(', ')
            if (node.computed)
                generate(node.property)
            else
                part(JSON.stringify(node.property.name))
            part(' )')
        },
        MemberAssignmentExpression: (node) => {
            part('espyset( ')
            generate(node.object)
            part(', ')
            if (node.computed)
                generate(node.property)
            else
                part(JSON.stringify(node.property.name))
            part(', ')
            generate(node.value)
            part(' )')
        },
        UpdateExpression: (node) => {
            generate(node.argument)
            switch(node.operator) {
                case '++':
                    part(' += 1')
                    break
                case '--':
                    part(' -= 1')
                    break
                default:
                    throw new Error('Unsupported update expression ' + node.operator)
            }
        },
        VariableDeclaration: (node) => {
            let separate = seperator(', ')
            for (let declaration of node.declarations) { separate(); part(declaration.id.name) }
            part(' = ')
            separate = seperator(', ')
            for (let declaration of node.declarations) { separate(); generate(declaration.init)}
        },
        FunctionDeclaration: (node) => {
            part('def ' + node.id.name + '(')
            let separate = seperator(', ')
            for (let param of node.params) { separate(); part(param.name) }
            part(')')
            part(':')
            part('\n')
            generate(node.body)
        },
        IfStatement: (node) => {
            part('if ')
            generate(node.test)
            part(':\n')
            generate(node.consequent)
            if (node.alternate) {
                part('\nelse:\n')
                generate(node.alternate)
            }
        },
        WhileStatement: (node) => { part('while '); generate(node.test); part(':\n'); generate(node.body) },
        BlockStatement: (node) => {
            let separate = seperator('\n')
            outdent()
            for (let line of node.body) {
                separate()
                dent()
                generate(line)
            }
            indent()
        },
        ObjectExpression: (node) => {
            if (node.properties.length == 0) {
                part('{}')
                return
            } else {
                part('{ ')
                let separate = seperator(', ')
                for (let property of node.properties) { separate(); generate(property) }
                part(' }')
            }
        },
        Property: (node) => {
            part(JSON.stringify(node.key.name) + ': ')
            generate(node.value)
        },
        ReturnStatement: (node) => {
            part('return')
            if (node.argument) {
                part(' ')
                generate(node.argument)
            }
        },
        UnaryExpression: (node) => {
            switch(node.operator) {
                case '!':
                    part('not ')
                    generate(node.argument)
                    break
                case '~':
                case '-':
                    part(node.operator)
                    generate(node.argument)
                    break
                default:
                    throw new Error('Unsupported unary operator ' + node.operator)
            }
        },
        Literal: (node) => {
            if (typeof node.value == 'boolean')
                part(node.value ? 'True' : 'False')
            else
                part(node.raw)
        },
        BreakStatement: (node) => { part('break') },
        ClassDeclaration: (node) => { part('class ' + node.id.name + ':\n'); generate(node.body) },
        BinaryExpression: (node) => { generate(node.left); part(' ' + node.operator + ' '); generate(node.right) },
        AssignmentExpression: (node) => { generate(node.left); part(' = '); generate(node.right) },
        ExpressionStatement: (node) => { generate(node.expression) },
        Identifier: (node) => { part(node.name) },
        Verbatim: (node) => { part(node.text) }
    }

    part(stdBody)

    generate(ast, 0)
    return parts.join('')
}