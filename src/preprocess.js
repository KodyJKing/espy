var print = require('./print')
var estraverse = require('estraverse')

var uniqueIdCounter = 0
function getUniqueId() {
    return 'tmp' + uniqueIdCounter++
}

module.exports = function (ast) {
    let result = ast
    let path = []
    for (let step of passes)
        estraverse.replace(
            result,
            {
                enter: (node) => { path.push(node) },
                leave: (node) => {
                    path.pop()
                    if (step[node.type])
                        return step[node.type](node, path)
                }
            }
        )
    return result
}

function convertSingleStatementToBlock(node, field) {
    let member = node[field]
    if (member && member.type != 'BlockStatement') {
        node[field] = {
            type: 'BlockStatement',
            body: [member]
        }
    }
}

function passEmptyBody(node) {
    if (node.body.length == 0)
        node.body = [{ type: 'Identifier', name: 'pass', espyType: 'PassStatement' }]
}

function arrowFunctionToFunctionExpression(node) {
    node.type = 'FunctionExpression'
    if (node.expression) {
        node.body.body[0] = {
            type: 'ReturnStatement',
            argument: node.body.body[0]
        }
    }
}

function methodDefinitionToFunctionDefenition(node, path) {
    let result = node.value
    result.id = node.key
    result.type = 'FunctionDeclaration'
    result.static = node.static
    if (!node.static) { result.params.splice(0, 0, { type: 'Identifier', name: 'this' }) }
    return result
}

function annotateStaticMethod(node, path) {
    if (node.static) {
        let parent = path[path.length - 1]
        let positionInParent = parent.body.indexOf(node)
        parent.body.splice(positionInParent, 0, { type: 'Identifier', name: '@staticmethod', espyType: 'Decorator' })
    }
}

function moveFunctionIntoBlock(node, path) {
    let i = path.length - 1; while (path[i].type !== 'BlockStatement') i--
    let parent = path[i]
    let positionInParent = parent.body.indexOf(path[i + 1])
    node.type = 'FunctionDeclaration'
    node.id = { type: 'Identifier', name: getUniqueId() }
    parent.body.splice(positionInParent, 0, node)
    return JSON.parse(JSON.stringify(node.id))
}

var passes = [
    {
        Program: (node) => { node.type = 'BlockStatement'; node.isProgram = true },
        ClassBody: (node) => { node.type = 'BlockStatement'; node.isClassBody = true },

        NewExpression: (node) => { node.type = 'CallExpression'; node.isNewExpression = true },

        FunctionExpression: (node) => { convertSingleStatementToBlock(node, 'body') },
        ArrowFunctionExpression: (node) => { convertSingleStatementToBlock(node, 'body') },
        WhileStatement: (node) => { convertSingleStatementToBlock(node, 'body') },
        ForStatement: (node) => { convertSingleStatementToBlock(node, 'body') },
        IfStatement: (node) => { convertSingleStatementToBlock(node, 'consequent'); convertSingleStatementToBlock(node, 'alternate') }
    },
    { ArrowFunctionExpression: arrowFunctionToFunctionExpression, MethodDefinition: methodDefinitionToFunctionDefenition },
    { FunctionExpression: moveFunctionIntoBlock, BlockStatement: passEmptyBody, FunctionDeclaration: annotateStaticMethod }
]