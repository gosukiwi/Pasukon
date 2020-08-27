const Result = require('./result')
const Evaluator = require('./evaluator')

module.exports = class Token {
  constructor (tokenName, code) {
    this.tokenName = tokenName
    this.code = code
  }

  parse (tokens) {
    if (tokens[0].is(this.tokenName)) {
      return Result.ok(tokens.slice(1), this.code ? Evaluator.eval(this.code, tokens[0].name) : tokens[0].name)
    }
    return Result.fail(tokens)
  }
}
