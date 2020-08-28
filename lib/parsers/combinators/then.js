const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Then {
  constructor (parsers, code, rule) {
    this.lhs = parsers[0]
    this.rhs = parsers[1]
    this.code = code
    this.rule = rule
    this.cacheKey = 'then'
  }

  parse (tokens) {
    const lhs = this.lhs.parse(tokens)
    if (lhs.failed) return lhs

    const rhs = this.rhs.parse(lhs.remaining)
    if (rhs.succeeded) {
      rhs.matched = this.code ? Evaluator.eval(this.code, lhs.matched, rhs.matched) : [lhs.matched, rhs.matched]
      return rhs
    }

    return Result.fail(tokens, this.rule)
  }

  getParsers () {
    return [this.lhs, this.rhs]
  }
}
