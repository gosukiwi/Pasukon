const Token = require('./token')
const Many0 = require('./combinators/many0')
const Or = require('./combinators/or')
const Then = require('./combinators/then')

module.exports = class Parser {
  constructor (rules) {
    this.combinators = {
      many0: Many0,
      or: Or,
      then: Then
    }
    this.parsers = {}
    this.start = null
    this.buildRules(rules)
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

    const Combinator = this.combinators[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find combinator '${definition.parser}'`) // TODO: Rule info in error

    const lhs = definition.lhs.type === 'UNARY_CALL' ? this.buildUnaryCall(definition.lhs) : this.buildRuleCall(definition.lhs)
    const rhs = definition.lhs.type === 'UNARY_CALL' ? this.buildUnaryCall(definition.rhs) : this.buildRuleCall(definition.rhs)
    return new Combinator([lhs, rhs])
  }

  buildUnaryCall (definition) {
    if (definition.parser === 'token') return new Token(definition.arg)

    const Combinator = this.combinators[definition.parser]
    if (Combinator === undefined) throw new Error(`Could not find combinator '${definition.parser}'`) // TODO: Rule info in error

    return new Combinator(this.buildRuleCall(definition.arg))
  }

  parse (tokens) {
    return this.parsers[this.start].parse(tokens)
  }
}
