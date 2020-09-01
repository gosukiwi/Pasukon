const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class UnaryCombinator {
  constructor (parser, code, rule) {
    this.parser = parser
    this.code = code
    this.rule = rule
  }

  parse (tokens) {
    throw new Error('Not implemented')
  }

  getParsers () {
    return [this.parser]
  }

  toString () {
    throw new Error('Not implemented')
  }

  ok (...args) {
    return Result.ok(...args)
  }

  fail (remaining) {
    return Result.fail(remaining, this.rule)
  }

  eval (matched) {
    return Evaluator.eval(this.code, matched)
  }
}
