const Lexer = require('./lexer/lexer')
const Parser = require('./parsers/parser')
const selfparse = require('./self-parse')

module.exports = class Pasukon {
  constructor (grammar, options = {}) {
    const definitions = selfparse(grammar.toString())
    this.lexer = options.lexer || this.buildLexer(definitions[0])

    if (definitions[0].type === 'LEXER') definitions.shift()
    this.parser = new Parser(definitions, options)
  }

  parse (input) {
    if (!input) throw new Error('Input missing. Provide a string-able object.')

    const result = this.parser.parse(this.lexer.lex(input.toString()))
    if (result.succeeded) {
      if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched
      const { line, col } = result.remaining.head
      throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found <TOKEN ${result.remaining.head.name}: ${result.remaining.head.match}>`)
    }

    const mostAdvancedFailure = this.parser.getMostAdvancedFailure()
    const { line, col } = mostAdvancedFailure.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. Expected '${mostAdvancedFailure.rule}', found <TOKEN ${mostAdvancedFailure.remaining.head.name}: ${mostAdvancedFailure.remaining.head.match}>`)
  }

  // private

  buildLexer (definition) {
    if (definition === undefined || definition.type !== 'LEXER') throw new Error('Lexer was not defined in grammar. Define it or provide a custom lexer.')
    return new Lexer(definition.tokens)
  }
}
