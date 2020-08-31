const memo = new Map()

module.exports = class MemoizableParser {
  constructor (parser, cacheKey) {
    this.parser = parser
    this.cacheKey = cacheKey
  }

  static clear () {
    memo.clear()
  }

  parse (tokens) {
    const key = this.cacheKey ^ tokens.cacheKey
    if (memo.has(key)) return memo.get(key)

    const value = this.parser.parse(tokens)
    memo.set(key, value)
    return value
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
