let _memo = {}
const memo = {
  set (key, value) {
    _memo[key] = value
    return value
  },

  get (key) {
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
  constructor (parser, cacheKey) {
    this.parser = parser
    this.cacheKey = cacheKey
  }

  static clear () {
    memo.clear()
  }

  parse (tokens) {
    return this.getMemo(tokens) || this.setMemo(tokens, this.parser.parse(tokens))
  }

  getParsers () {
    return this.parser.getParsers()
  }

  toString () {
    return this.parser.toString()
  }

  get tokenName () {
    return this.parser.tokenName
  }

  // private

  hasMemo (tokens) {
    return memo.has(`${this.cacheKey}-${tokens.cacheKey}`)
  }

  getMemo (tokens) {
    return memo.get(`${this.cacheKey}-${tokens.cacheKey}`)
  }

  setMemo (tokens, value) {
    return memo.set(`${this.cacheKey}-${tokens.cacheKey}`, value)
  }
}
