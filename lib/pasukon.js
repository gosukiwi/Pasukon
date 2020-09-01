const Parser = require('./parsers/parser')
const selfparse = require('./self-parse')

module.exports = class Pasukon {
  constructor (grammar, options = {}) {
    if (!grammar) throw new Error('Please provide a grammar either as a string or a pre-compiled JavaScript object')

    const definitions = typeof grammar === 'string' ? selfparse(grammar) : grammar
    this.parser = new Parser(definitions, options)
  }

  parse (input) {
    if (!input) throw new Error('Input missing. Provide a string-able object.')

    const result = this.parser.parse(input.toString())
    if (result.succeeded) {
      if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched
      const { line, col } = result.remaining.head
      throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found ${result.remaining.head}`)
    }

    const mostAdvancedFailure = this.parser.getMostAdvancedFailure()
    const { line, col } = mostAdvancedFailure.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. In rule '${mostAdvancedFailure.rule}', found ${mostAdvancedFailure.remaining.head}`)
  }
}
