const grammarParser = require('./grammar')
const Lexer = require('./lexer/lexer')
const Parser = require('./parsers/parser')

module.exports = class Pasukon {
  constructor (grammar, options = {}) {
    const definitions = grammarParser.parse(grammar.toString())
    this.lexer = options.lexer || this.buildLexer(definitions[0])

    if (definitions[0].type === 'LEXER') definitions.shift()
    this.parser = new Parser(definitions, options)
  }

  parse (input) {
    const result = this.parser.parse(this.lexer.lex(input))
    if (result.succeeded) return result.matched

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
