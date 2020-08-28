const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class Many0 {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
    this.cacheKey = 'many0'
  }

  parse (tokens) {
    if (tokens.isEmpty()) return Result.ok(tokens)

    let remaining = tokens
    let matched = []
    while (!remaining.isEmpty()) {
      const result = this.parser.parse(remaining)
      if (result.matched !== null) matched = matched.concat(result.matched)

      if (result.failed) {
        return Result.ok(remaining, this.code ? Evaluator.eval(this.code, matched) : matched)
      }

      remaining = result.remaining
    }
  }

  getParsers () {
    return [this.parser]
  }
}
