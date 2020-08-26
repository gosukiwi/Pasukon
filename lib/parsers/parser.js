const Token = require('./token')
const Many0 = require('./combinators/many0')
const Or = require('./combinators/or')

module.exports = class Parser {
  constructor (rules) {
    this.combinators = {
      many0: Many0,
      or: Or
    }
    this.parsers = {}
    this.start = null
    this.buildRules(rules)
  }

  buildRules (rules) {
    rules.forEach((rule) => {
      const parsers = rule.definitions.map((definition) => {
        return this.buildDefinition(definition)
      })
      // join parsers using OR
      this.parsers[rule.name] = new Or(parsers)
      this.start = rule.name
    })
  }

  buildDefinition (definition) {
    if (definition.type === 'UNARY_CALL') {
      if (definition.parser === 'token') return new Token(definition.arg)

      const Combinator = this.combinators[definition.parser]
      if (Combinator === undefined) throw new Error(`Could not find combinator '${definition.parser}'`) // TODO: Rule info in error

      const argumentParser = this.parsers[definition.arg]
      if (argumentParser === undefined) throw new Error(`Could not find parser '${argumentParser}'`)

      return new Combinator(argumentParser)
    }

    throw new Error('Not Implemented')
  }

  parse (tokens) {
    return this.parsers[this.start].parse(tokens)
  }
}
