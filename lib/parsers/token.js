const Result = require('./result')

module.exports = class Token {
  constructor (tokenName) {
    this.tokenName = tokenName
  }

  parse (tokens) {
    if (tokens[0].is(this.tokenName)) return Result.ok(tokens.slice(1))
    return Result.fail(tokens)
  }
}
