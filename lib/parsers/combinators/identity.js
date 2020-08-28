const Result = require('../result')
const Evaluator = require('../evaluator')

// This combinator is used to wrap a code evaluation around a parser. It's meant
// for internal use, as it's pretty much useless in the grammar.
module.exports = class Identity {
  constructor (getParser, code, rule) {
    this.getParser = getParser
    this._parser = null
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const result = this.parser.parse(tokens)
    if (result.failed) return Result.fail(result.remaining, this.rule)

    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }

  getParsers () {
    return [this.parser]
  }

  get parser () {
    if (this._parser === null) this._parser = this.getParser()
    return this._parser
  }

  get cacheKey () {
    if (this._cacheKey === null) this._cacheKey = `identity-${this.parser.cacheKey}`
    return this._cacheKey
  }
}
