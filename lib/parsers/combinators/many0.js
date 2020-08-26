const Result = require('../result')

module.exports = class Many0 {
  constructor (parser) {
    this.parser = parser
  }

  parse (tokens) {
    if (tokens.length === 0) return Result.ok(tokens)

    let remaining = tokens
    while (remaining.length > 0) {
      const result = this.parser.parse(remaining)
      if (result.failed) return Result.ok(remaining)

      remaining = result.remaining
    }
  }
}
