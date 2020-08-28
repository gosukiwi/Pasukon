const Evaluator = require('../evaluator')

module.exports = class As {
  constructor (parsers, code, rule) {
    if (!Object.prototype.hasOwnProperty.call(parsers[1], 'tokenName')) throw new Error("AS combinator only works with a token as the RHS: '(my-parser as :somename)'")

    this.lhs = parsers[0]
    this.name = parsers[1].tokenName
    this.code = code
    this.rule = rule
    this._cacheKey = null
  }

  parse (tokens) {
    const result = this.lhs.parse(tokens)
    result.matched = { name: this.name, value: result.matched }
    if (this.code) result.matched = Evaluator.eval(this.code, result.matched)
    return result
  }

  getParsers () {
    return [this.lhs]
  }

  get cacheKey () {
    if (this._cacheKey === null) this._cacheKey = `as-${this.lhs.cacheKey}-${this.name}`
    return this._cacheKey
  }

  toString () {
    return `[AS ${this.lhs} ${this.name}]`
  }
}
