const Lexer = require('../../lib/lexer/lexer')
const grammar = require('../../lib/grammar')
const expect = require('chai').expect

describe('lexer/lexer', function () {
  it('scans literal', function () {
    const definitions = grammar.parse(`
lex
  A 'A'
  ASD /asd/
/lex
    `)

    const lexer = new Lexer(definitions[0].tokens)
    const tokens = lexer.lex('AasdA')

    expect(tokens.map((t) => t.name)).to.eql(['A', 'ASD', 'A', 'EOF'])
  })
})
