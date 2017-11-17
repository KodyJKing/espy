var estraverse = require('estraverse')

module.exports = function (ast) {
    let result = ast
    for (let step of passes)
        estraverse.replace(
            result,
            {
                leave: (node) => {
                    let stepFunc = step[node.type]
                    if (stepFunc) stepFunc(node)
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
        return true
    }
    return false
}

function passEmptyBody(node) {
    if (node.body.length == 0) {
        node.body = [{ type: 'Identifier', espyType: 'PassStatement' }]
        return node
    }
}

var passes = [
    {
        Program: (node) => {
            node.type = 'BlockStatement'
            return node
        }
    },
    {
        IfStatement: (node) => {
            let changed = false
            if (convertSingleStatementToBlock(node, 'consequent')) changed = true
            if (convertSingleStatementToBlock(node, 'alternate')) changed = true
            if (changed) return node
        },
        WhileStatement: (node) => { convertSingleStatementToBlock(node, 'body') },
        ForStatement: (node) => { convertSingleStatementToBlock(node, 'body') }
    },
    {
        BlockStatement: passEmptyBody
    }
]