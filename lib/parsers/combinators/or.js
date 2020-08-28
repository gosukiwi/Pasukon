const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Or {
  constructor (parsers, code, rule) {
    this.parsers = parsers
    this.code = code
    this.rule = rule
    this.cacheKey = 'or'
  }

  parse (tokens) {
    for (let i = 0, len = this.parsers.length; i < len; i++) {
      const result = this.parsers[i].parse(tokens)
      if (result.succeeded) {
        if (this.code) {
          result.matched = Evaluator.eval(this.code, result.matched)
        }
        return result
      }
    }

    return Result.fail(tokens, this.rule)
  }

  getParsers () {
    return this.parsers
  }
}
