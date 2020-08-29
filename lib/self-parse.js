const ast = require('./grammar.json')
const Lexer = require('./lexer/lexer')
const Parser = require('./parsers/parser')

// Returns a parser that is already pre-loaded with the pasukon grammar. Used
// internally to match itself.
module.exports = function parse (input) {
  const lexer = new Lexer(ast[0].tokens)
  const parser = new Parser(ast.slice(1))
  const result = parser.parse(lexer.lex(input))

  if (result.succeeded) {
    if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched

    const { line, col } = result.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found <TOKEN ${result.remaining.head.name}: ${result.remaining.head.match}>`)
  }

  const mostAdvancedFailure = parser.getMostAdvancedFailure()
  const { line, col } = mostAdvancedFailure.remaining.head
  throw new Error(`Syntax error line ${line}, column ${col}. Expected '${mostAdvancedFailure.rule}', found <TOKEN ${mostAdvancedFailure.remaining.head.name}: ${mostAdvancedFailure.remaining.head.match}>`)
}
