const Token = require('./token')
const Many0 = require('./combinators/many0')
const Many1 = require('./combinators/many1')
const Optional = require('./combinators/optional')
const Or = require('./combinators/or')
const Then = require('./combinators/then')
const Identity = require('./combinators/identity')

module.exports = class Parser {
  constructor (rules) {
    this.combinators = {
      binary: {
        or: Or,
        then: Then
      },
      unary: {
        many0: Many0,
        many1: Many1,
        opt: Optional
      }
    }
    this.parsers = {}
    this.start = null
    this.buildRules(rules)
    this.checkForLeftRecursion()
  }

  parse (tokens) {
    if (this.start === null) throw new Error('No rules found')
    return this.parsers[this.start].parse(tokens)
  }

  addBinaryCombinator (name, klass) {
    if (!/[a-zA-Z][a-zA-Z0-9_-]*/.test(name)) throw new Error('Invalid name. It must start with a letter and only contain a-z, A-Z, 0-9, - and _.')

    this.combinators.binary[name] = klass
    return this
  }

  addUnaryCombinator (name, klass) {
    if (!/[a-zA-Z][a-zA-Z0-9_-]*/.test(name)) throw new Error('Invalid name. It must start with a letter and only contain a-z, A-Z, 0-9, - and _.')

    this.combinators.unary[name] = klass
    return this
  }

  // private

  buildRules (rules) {
    rules.forEach((rule) => {
      const parsers = rule.definitions.map((definition) => this.parserFor(rule.name, definition))
      this.parsers[rule.name] = new Or(parsers, undefined, rule.name)
      this.start = rule.name
    })
  }

  parserFor (rule, definition) {
    if (definition.type === 'UNARY_CALL') return this.buildUnaryCall(rule, definition)
    if (definition.type === 'BINARY_CALL') return this.buildBinaryCall(rule, definition)
    return this.buildRuleCall(rule, definition)
  }

  buildRuleCall (rule, definition) {
    if (definition.name === 'token') throw new Error('Token can only be called as unary')

    const getParser = (function (parsers, name, rule) {
      return function () {
        const parser = parsers[name]
        if (parser === undefined) throw new Error(`Could not find parser '${name}' in rule '${rule}'`)
        return parser
      }
    }(this.parsers, definition.name, rule))

    return new Identity(getParser, definition.code)
  }

  buildBinaryCall (rule, definition) {
    if (definition.parser === 'token') throw new Error('Token can only be called as unary')

    const Combinator = this.combinators.binary[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find binary combinator: '${definition.parser}' in rule '${rule}'`)

    const lhs = this.parserFor(rule, definition.lhs)
    const rhs = this.parserFor(rule, definition.rhs)
    return new Combinator([lhs, rhs], definition.code)
  }

  buildUnaryCall (rule, definition) {
    if (definition.parser === 'token') {
      if (definition.arg.type !== 'RULE_CALL') throw new Error('Tokens cannot call other rules or combinators')
      return new Token(definition.arg.name, definition.code)
    }

    const Combinator = this.combinators.unary[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find unary combinator: '${definition.parser}' in rule '${rule}'`)

    return new Combinator(this.parserFor(rule, definition.arg), definition.code)
  }

  checkForLeftRecursion () {
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
