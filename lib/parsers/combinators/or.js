const Result = require('../result')

module.exports = class Or {
  constructor (parsers) {
    this.parsers = parsers
  }

  parse (tokens) {
    for (let i = 0, len = this.parsers.length; i < len; i++) {
      const result = this.parsers[i].parse(tokens)
      if (result.succeeded) return result
    }

    return Result.fail(tokens)
  }
}
