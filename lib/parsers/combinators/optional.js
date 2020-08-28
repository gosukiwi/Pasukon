const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Optional {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const result = this.parser.parse(tokens)
    const matched = this.code ? Evaluator.eval(this.code, result.matched) : result.matched
    return Result.ok(result.remaining, matched)
  }

  getParsers () {
    return [this.parser]
  }

  get cacheKey () {
    if (this._cacheKey === null) this._cacheKey = `optional-${this.parser.cacheKey}`
    return this._cacheKey
  }

  toString () {
    return `[OPTIONAL ${this.parser}]`
  }
}
