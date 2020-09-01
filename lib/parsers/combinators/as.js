const Evaluator = require('../evaluator')

module.exports = class As {
  constructor (parsers, code, rule) {
    if (parsers[1].tokenName === undefined) throw new Error("AS combinator only works with a token as the RHS: '(my-parser as :somename)'")

    this.lhs = parsers[0]
    this.name = parsers[1].tokenName
    this.code = code
    this.rule = rule
  }

  parse (tokens) {
    const result = this.lhs.parse(tokens).clone()
    result.matched = { name: this.name, value: result.matched }
    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }

  getParsers () {
    return [this.lhs]
  }

  toString () {
    return `[AS ${this.lhs} ${this.name}]`
  }
}
