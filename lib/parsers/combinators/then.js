const Result = require('../result')

module.exports = class Then {
  constructor (parsers) {
    if (parsers.length !== 2) throw new Error("'Then' combinator only works with two parsers.")

    this.lhs = parsers[0]
    this.rhs = parsers[1]
  }

  parse (tokens) {
    let result = this.lhs.parse(tokens)
    if (result.failed) return result

    result = this.rhs.parse(result.remaining)
    if (result.succeeded) return result

    return Result.fail(tokens)
  }
}
