const Result = require('./result')
const Evaluator = require('./evaluator')

module.exports = class Token {
  constructor (tokenName, code) {
    this.tokenName = tokenName
    this.code = code
    this._cacheKey = null
  }

  parse (tokens) {
    if (tokens.peek(this.tokenName)) {
      return Result.ok(tokens.tail, this.code ? Evaluator.eval(this.code, tokens.head.match) : tokens.head.match)
    }

    return Result.fail(tokens)
  }

  getParsers () {
    return [this]
  }

  toString () {
    return `[TOKEN ${this.tokenName}]`
  }
}
