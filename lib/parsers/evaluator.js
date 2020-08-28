let $ = {}

module.exports = {
  eval (code, a, b) {
    if (!code) return null;

    return (function ($1, $2) {
      const matches = [$1, $2].flat()
      for (let i = 0, len = matches.length; i < len; i++) {
        const matched = matches[i]
        if (matched === undefined) continue

        if (Object.prototype.hasOwnProperty.call(matched, 'name')) {
          eval(`var $${matched.name} = ${JSON.stringify(matched.value)};`)
        }
      }

      return eval(code)
    }(a, b))
  },

  setContext (context) {
    $ = context
  }
}
