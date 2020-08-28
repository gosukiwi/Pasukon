const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Or {
  constructor (parsers, code, rule) {
    this.parsers = parsers
    this.code = code
    this.rule = rule
    this._cacheKey = null
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

  get cacheKey () {
    if (this._cacheKey === null) this._cacheKey = `or-${this.parsers.map((p) => p.cacheKey).join('-')}`
    return this._cacheKey
  }
}
