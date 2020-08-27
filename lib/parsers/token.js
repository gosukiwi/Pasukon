const Result = require('./result')

module.exports = class Token {
  constructor (tokenName, code) {
    this.tokenName = tokenName
  }

  parse (tokens) {
    if (tokens[0].is(this.tokenName)) return Result.ok(tokens.slice(1), tokens[0].name)
    return Result.fail(tokens)
  }
}
