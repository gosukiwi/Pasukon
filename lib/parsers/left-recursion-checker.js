const Token = require('./token')

module.exports = class LeftRecursionChecker {
  constructor (parsers) {
    this.parsers = parsers
  }

  check () {
    Object.keys(this.parsers).forEach((rule) => this.checkRuleForLeftRecursion(rule, rule, []))
  }

  // For each OR, it cannot start with `rule`
  // if it calls other rules, those rules also cannot start with `rule`
  checkRuleForLeftRecursion (rule, cannotStartWith, stack) {
    this.parsers[rule].getParsers().forEach((parser) => { // all rules start with an or parser, that has at least one parser inside
      const leftmost = this.leftmostFor(parser)
      if (leftmost instanceof Token) return // terminal, we're done

      stack.push(rule)
      if (leftmost.rule === cannotStartWith) throw new Error(`Left recursion found: ${stack.join(' -> ')} -> ${cannotStartWith}`)
      if (stack.includes(leftmost.rule)) return // already checked
      this.checkRuleForLeftRecursion(leftmost.rule, cannotStartWith, stack)
    })
  }

  leftmostFor (parser) {
    if (parser === undefined) throw new Error('Could not find leftmost parser')
    if (parser instanceof Token) return parser
    if (parser.rule !== undefined) return parser
    return this.leftmostFor(parser.getParsers()[0])
  }
}
