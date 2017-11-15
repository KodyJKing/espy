module.exports = function ionstringify(o) {
    let parts = []
    let part = (str) => { parts.push(str) }
    let end = () => { part('\n') }

    function internal(o, depth) {
        let dent = () => { for (let i = 0; i < depth; i++) part('  ') }

        if (typeof o == 'object') {
            let inline = JSON.stringify(o).length < 80
            let isArray = Array.isArray(o)
            let i = 0
            let count = Object.keys(o || {}).length
            if (inline) {
                part(isArray ? '[ ' : '{ ')
            } else {
                part(isArray ? '[]' : '{}')
                dent()
                end()
                depth += 1
            }

            for (let key in o) {
                if (!inline) dent()
                if (i++ > 0 && inline) part(', ')
                if (!isArray) part(key + ': ')
                internal(o[key], depth)
                if (!inline && i < count) end()
            }

            if (inline) part(isArray ? ' ]' : ' }')

        } else {
            part(JSON.stringify(o))
        }
    }

    internal(o, 0, parts)
    return parts.join('')
}