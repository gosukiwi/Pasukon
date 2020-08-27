const Token = require('./token')
const Many0 = require('./combinators/many0')
const Or = require('./combinators/or')
const Then = require('./combinators/then')

module.exports = class Parser {
  constructor (rules) {
    this.combinators = {
      binary: {
        or: Or,
        then: Then
      },
      unary: {
        many0: Many0
      }
    }
    this.parsers = {}
    this.start = null
    this.buildRules(rules)
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

  buildRules (rules) {
    rules.forEach((rule) => {
      const parsers = rule.definitions.map((definition) => {
        return this.parserFor(definition)
      })
      // join parsers using OR
      this.parsers[rule.name] = new Or(parsers)
      this.start = rule.name
    })
  }

  parserFor (definition) {
    if (definition.type === 'UNARY_CALL') return this.buildUnaryCall(definition)
    if (definition.type === 'BINARY_CALL') return this.buildBinaryCall(definition)
    return this.buildRuleCall(definition)
  }

  buildRuleCall (definition) {
    if (definition === 'token') throw new Error('Token can only be called as unary')

    const parser = this.parsers[definition]
    if (parser === undefined) throw new Error(`Could not find parser '${definition}'`)
    return parser
  }

  buildBinaryCall (definition) {
    if (definition.parser === 'token') throw new Error('Token can only be called as unary')

    const Combinator = this.combinators.binary[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find binary combinator: '${definition.parser}'`) // TODO: Rule info in error

    const lhs = this.parserFor(definition.lhs)
    const rhs = this.parserFor(definition.rhs)
    return new Combinator([lhs, rhs])
  }

  buildUnaryCall (definition) {
    if (definition.parser === 'token') return new Token(definition.arg)

    const Combinator = this.combinators.unary[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find unary combinator: '${definition.parser}'`) // TODO: Rule info in error

    return new Combinator(this.parserFor(definition.arg))
  }

  parse (tokens) {
    return this.parsers[this.start].parse(tokens)
  }
}
