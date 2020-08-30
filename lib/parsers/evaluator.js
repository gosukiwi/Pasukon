const flatten = require('../util/flatten')
let $ = {}

module.exports = {
  eval (code, a, b) {
    if (!code) return null

    const params = {}
    const matches = flatten([a, b])
    for (let i = 0, len = matches.length; i < len; i++) {
      const matched = matches[i]
      if (matched && Object.prototype.hasOwnProperty.call(matched, 'name')) {
        params[matched.name] = matched.value
      }
    }

    if (typeof code === 'function') return code(a, b, params, $)

    return (new Function ('$1', '$2', '$', '$ctx', code))(a, b, params, $)
  },

  setContext (context) {
    $ = context
  }
}
