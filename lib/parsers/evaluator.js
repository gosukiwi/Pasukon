let $ = {}

module.exports = {
  eval (code, a, b) {
    if (!code) return null

    return (function ($1, $2) { return eval(code) }(a, b))
  },

  setContext (context) {
    $ = context
  }
}
