let memo = {}

module.exports = class MemoizableParser {
  constructor (parser, cacheKey) {
    this.parser = parser
    this.cacheKey = cacheKey
  }

  static clear () {
    memo = {}
  }

  parse (tokens) {
    const key = this.cacheKey ^ tokens.cacheKey
    return memo[key] || (memo[key] = this.parser.parse(tokens))
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
}
