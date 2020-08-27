const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Then {
  constructor (parsers, code) {
    this.lhs = parsers[0]
    this.rhs = parsers[1]
    this.code = code
  }

  parse (tokens) {
    const lhs = this.lhs.parse(tokens)
    if (lhs.failed) return lhs

    const rhs = this.rhs.parse(lhs.remaining)
    if (rhs.succeeded) {
      if (this.code) {
        rhs.matched = Evaluator.eval(this.code, lhs.matched, rhs.matched)
      }
      return rhs
    }

    return Result.fail(tokens)
  }
}
