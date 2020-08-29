const crypto = require('crypto')
const Token = require('./token-parser')
const Many0 = require('./combinators/many0')
const Many1 = require('./combinators/many1')
const Optional = require('./combinators/optional')
const Or = require('./combinators/or')
const Then = require('./combinators/then')
const Identity = require('./combinators/identity')
const As = require('./combinators/as')
const LeftRecursionChecker = require('./left-recursion-checker')
const TokenList = require('./token-list')
const MemoizableParser = require('./memoizable-parser')
const DebuggableParser = require('./debuggable-parser')
const Result = require('./result')

function sha1 (input) {
  return crypto.createHash('sha1').update(input).digest('base64')
}

const DEFAULT_OPTIONS = {
  start: null,
  cache: false,
  debug: false,
  logger: null
}

module.exports = class Parser {
  constructor (rules, options = {}) {
    this.combinators = {
      binary: {
        or: Or,
        then: Then,
        as: As
      },
      unary: {
        many0: Many0,
        many1: Many1,
        opt: Optional
      }
    }
    this.parsers = {}
    this.options = Object.assign({}, DEFAULT_OPTIONS, options)
    const lastRule = this.buildRules(rules)
    this.start = this.options.start || lastRule
    if (this.start === null) throw new Error('No rules found')

    new LeftRecursionChecker(this.parsers).check()
  }

  parse (tokens) {
    if (this.options.cache) MemoizableParser.clear()
    Result.clear()

    const parser = this.parsers[this.start]
    if (!parser) throw new Error(`Could not find starting parser: '${this.start}'`)
    return parser.parse(new TokenList(tokens))
  }

  getMostAdvancedFailure () {
    return Result.getMostAdvancedFailure()
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
    let lastRule = null
    rules.forEach((rule) => {
      const parsers = rule.definitions.map((definition) => this.parserFor(rule.name, definition))
      this.parsers[rule.name] = this.decorate(new Or(parsers, undefined, rule.name), rule)
      lastRule = rule.name
    })

    return lastRule
  }

  parserFor (rule, definition) {
    let parser = null
    if (definition.type === 'UNARY_CALL') {
      parser = this.buildUnaryCall(rule, definition)
    } else if (definition.type === 'BINARY_CALL') {
      parser = this.buildBinaryCall(rule, definition)
    } else {
      parser = this.buildRuleCall(rule, definition)
    }

    return this.decorate(parser, definition)
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

  decorate (parser, definition) {
    let final = parser

    if (this.options.cache && !(parser instanceof Token)) {
      final = new MemoizableParser(final, sha1(JSON.stringify(definition)))
    }

    if (this.options.debug) {
      final = new DebuggableParser(final, this.options.logger)
    }

    return final
  }
}
