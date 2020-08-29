const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Many1 {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    if (tokens.isEmpty()) return Result.fail(tokens, this.rule)

    let remaining = tokens
    let matched = []
    while (!remaining.isEmpty()) {
      const result = this.parser.parse(remaining)
      if (result.matched !== null) matched = matched.concat(result.matched)

      if (result.failed) {
        if (matched.length === 0) {
          return Result.fail(tokens, this.rule)
        } else {
          return Result.ok(remaining, this.code ? Evaluator.eval(this.code, matched) : matched)
        }
      }

      remaining = result.remaining
    }
  }

  getParsers () {
    return [this.parser]
  }

  toString () {
    return `[MANY1 ${this.parser}]`
  }
}
