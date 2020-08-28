let _memo = {}
const memo = {
  set (key, value) {
    _memo[key] = value
    return value
  },

  get (key, value) {
    return _memo[key]
  },

  has (key) {
    return Object.prototype.hasOwnProperty.call(_memo, key)
  },

  clear () {
    _memo = {}
  }
}

module.exports = class MemoizableParser {
  constructor (parser) {
    this.parser = parser
  }

  static clear () {
    memo.clear()
  }

  parse (tokens) {
    if (this.hasMemo(tokens)) return this.getMemo(tokens)
    return this.setMemo(tokens, this.parser.parse(tokens))
  }

  getParsers () {
    return this.parser.getParsers()
  }

  // private

  hasMemo (tokens) {
    return memo.has(`${this.parser.cacheKey}-${tokens.cacheKey}`)
  }

  getMemo (tokens) {
    return memo.get(`${this.parser.cacheKey}-${tokens.cacheKey}`)
  }

  setMemo (tokens, value) {
    return memo.set(`${this.parser.cacheKey}-${tokens.cacheKey}`, value)
  }
}
