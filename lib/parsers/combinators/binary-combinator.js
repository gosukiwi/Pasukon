const Result = require('../result')
const Evaluator = require('../evaluator')

module.exports = class BinaryCombinator {
  constructor (parsers, code, rule) {
    this.parsers = parsers
    this.code = code
    this.rule = rule
  }

  parse (tokens) {
    throw new Error('Not implemented')
  }

  getParsers () {
    return this.parsers
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

  eval (lhs, rhs) {
    return Evaluator.eval(this.code, lhs, rhs)
  }
}
