var ionstringify = require('./ionstringify')
module.exports = function print() {
    let parts = []
    for (let o of arguments) {
        if (typeof o == 'object')
            parts.push(ionstringify(o))
        else if (o == undefined)
            parts.push('')
        else
            parts.push(o)
    }
    console.log(parts.join(' '))
}