const Lexer = require('../lexer/lexer')
const TokenList = require('./token-list')
const Token = require('./token-parser')
const Result = require('./result')
const Many0 = require('./combinators/many0')
const Many1 = require('./combinators/many1')
const Optional = require('./combinators/optional')
const Or = require('./combinators/or')
const Then = require('./combinators/then')
const Identity = require('./combinators/identity')
const As = require('./combinators/as')
const LeftRecursionChecker = require('./left-recursion-checker')
const MemoizableParser = require('./memoizable-parser')
const DebuggableParser = require('./debuggable-parser')

function hashCode (s) {
  for (var i = 0, h = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0
  }

  return h
}

const DEFAULT_OPTIONS = {
  start: null,
  cache: false,
  debug: false,
  logger: null,
  lexer: null,
  combinators: {}
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

    this.lexer = this.options.lexer || this.buildLexer(rules[0])
    if (rules[0].type === 'LEXER') rules = rules.slice(1)

    this.buildCustomCombinators()

    const lastRule = this.buildRules(rules)
    this.start = this.options.start || lastRule
    if (this.start === null) throw new Error('No rules found')

    new LeftRecursionChecker(this.parsers).check()
  }

  parse (input) {
    if (this.options.cache) MemoizableParser.clear()
    Result.clear()

    const parser = this.parsers[this.start]
    if (!parser) throw new Error(`Could not find starting parser: '${this.start}'`)
    return parser.parse(new TokenList(this.lexer.lex(input)))
  }

  getMostAdvancedFailure () {
    return Result.getMostAdvancedFailure()
  }

  // private

  buildCustomCombinators () {
    if (this.options.combinators.unary) {
      Object.keys(this.options.combinators.unary).forEach((name) => {
        this.addCombinator(name, this.options.combinators.unary[name], 'unary')
      })
    }

    if (this.options.combinators.binary) {
      Object.keys(this.options.combinators.binary).forEach((name) => {
        this.addCombinator(name, this.options.combinators.binary[name], 'binary')
      })
    }
  }

  addCombinator (name, klass, mode) {
    if (!/[a-zA-Z][a-zA-Z0-9_-]*/.test(name)) throw new Error('Invalid name. Combinators must start with a letter and only contain a-z, A-Z, 0-9, - and _')

    this.combinators[mode][name] = klass
    return this
  }

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
      final = new MemoizableParser(final, hashCode(JSON.stringify(definition)))
    }

    if (this.options.debug) {
      final = new DebuggableParser(final, this.options.logger)
    }

    return final
  }

  buildLexer (definition) {
    if (definition === undefined || definition.type !== 'LEXER') throw new Error('Lexer was not defined in grammar. Define it or provide a custom lexer.')
    return new Lexer(definition.tokens)
  }
}
