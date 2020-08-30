const Parser = require('./parsers/parser')
const selfparse = require('./self-parse')

module.exports = class Pasukon {
  constructor (grammar, options = {}) {
    const definitions = selfparse(grammar.toString())
    this.parser = new Parser(definitions, options)
  }

  parse (input) {
    if (!input) throw new Error('Input missing. Provide a string-able object.')

    const result = this.parser.parse(input.toString())
    if (result.succeeded) {
      if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched
      const { line, col } = result.remaining.head
      throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found <TOKEN ${result.remaining.head.name}: ${result.remaining.head.match}>`)
    }

    const mostAdvancedFailure = this.parser.getMostAdvancedFailure()
    const { line, col } = mostAdvancedFailure.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. Expected '${mostAdvancedFailure.rule}', found <TOKEN ${mostAdvancedFailure.remaining.head.name}: ${mostAdvancedFailure.remaining.head.match}>`)
  }
}
