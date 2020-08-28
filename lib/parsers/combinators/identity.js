const Evaluator = require('../evaluator')

// This combinator is used to wrap a code evaluation around a parser. It's meant
// for internal use, as it's pretty much useless in the grammar.
module.exports = class Identity {
  constructor (getParser, code, rule) {
    this.getParser = getParser
    this.parser = null
    this.code = code
    this.rule = rule
    this.cacheKey = 'identity'
  }

  parse (tokens) {
    this.parser = this.parser || this.getParser()
    const result = this.parser.parse(tokens)
    if (result.failed) return result

    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }

  getParsers () {
    return [this.getParser()]
  }
}
