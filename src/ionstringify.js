module.exports = function ionstringify(o) {
    let parts = []
    let indentLevel = 0
    let part = (str) => { parts.push(str) }
    let outdent = () => { indentLevel++ }
    let indent = () => { indentLevel-- }
    let dent = () => { for (let i = 0; i < indentLevel; i++) part('  ') }
    let seperator = (str) => { let i = 0; return () => { if (i++ > 0) part(str) } }

    function internal(o) {
        if (typeof o == 'object' && o !== null) {
            let jsonLength = JSON.stringify(o).length
            let inline = jsonLength < 80
            let isArray = Array.isArray(o)
            let seperate = seperator(inline ? ', ' : ',\n')

            if (jsonLength == 2) {
                part(isArray ? '[]' : '{}')
                return
            }

            if (inline) {
                part(isArray ? '[ ' : '{ ')
            } else {
                part(isArray ? '[]\n' : '{}\n')
                outdent()
            }

            for (let key in o) {
                seperate()
                if (!inline) dent()
                if (!isArray) part(key + ': ')
                internal(o[key])
            }

            if (inline)
                part(isArray ? ' ]' : ' }')
            else
                indent()

        } else {
            part(JSON.stringify(o))
        }
    }

    internal(o, 0, parts)
    return parts.join('')
}