const ast = require('./grammar')
const Parser = require('./parsers/parser')

// Returns a parser that is already pre-loaded with the pasukon grammar. Used
// internally to match itself.
module.exports = function parse (input) {
  const parser = new Parser(ast)
  const result = parser.parse(input)

  if (result.succeeded) {
    if (result.remaining.isEmpty() || result.remaining.head.is('EOF')) return result.matched

    const { line, col } = result.remaining.head
    throw new Error(`Syntax error line ${line}, column ${col}. Expected EOF, found <TOKEN ${result.remaining.head.name}: ${result.remaining.head.match}>`)
  }

  const mostAdvancedFailure = parser.getMostAdvancedFailure()
  const { line, col } = mostAdvancedFailure.remaining.head
  throw new Error(`Syntax error line ${line}, column ${col}. Expected '${mostAdvancedFailure.rule}', found <TOKEN ${mostAdvancedFailure.remaining.head.name}: ${mostAdvancedFailure.remaining.head.match}>`)
}
