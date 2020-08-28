const Result = require('./result')
const Evaluator = require('./evaluator')

module.exports = class Token {
  constructor (tokenName, code) {
    this.tokenName = tokenName
    this.code = code
  }

  parse (tokens) {
    if (tokens.peek(this.tokenName)) {
      return Result.ok(tokens.tail, this.code ? Evaluator.eval(this.code, tokens.head.name) : tokens.head.name)
    }

    return Result.fail(tokens)
  }
}
