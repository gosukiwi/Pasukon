const Evaluator = require('../evaluator')

// This combinator is used to wrap a code evaluation around a parser. It's meant
// for internal use, as it's pretty much useless in the grammar.
module.exports = class Identity {
  constructor (parser, code) {
    this.parser = parser
    this.code = code
  }

  parse (tokens) {
    const result = this.parser.parse(tokens)
    if (result.failed) return result

    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }
}
