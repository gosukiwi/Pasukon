const grammarParser = require('./grammar')
const Lexer = require('./lexer/lexer')
const Parser = require('./parsers/parser')

module.exports = class Pasukon {
  constructor (grammar, options = {}) {
    const definitions = grammarParser.parse(grammar)
    this.lexer = options.lexer || this.buildLexer(definitions[0])

    if (definitions[0].type === 'LEXER') definitions.shift()
    this.parser = new Parser(definitions, options)
  }

  parse (input) {
    return this.parser.parse(this.lexer.lex(input)).matched
  }

  buildLexer (definition) {
    if (definition === undefined || definition.type !== 'LEXER') throw new Error('Lexer was not defined in grammar. Define it or provide a custom lexer.')
    return new Lexer(definition.tokens)
  }
}
