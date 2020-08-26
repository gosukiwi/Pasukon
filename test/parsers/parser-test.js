const grammar = require('../../lib/grammar')
const expect = require('chai').expect
const Lexer = require('../test-lexer')
const Parser = require('../../lib/parsers/parser')

describe('parsers/token-parser', function () {
  it('parses A', function () {
    const definitions = grammar.parse(`
statement
  | :A
  | :B
  ;
    `)
    const parser = new Parser(definitions)
    const lexer = new Lexer()

    const result = parser.parse(lexer.lex('A'))

    expect(result.succeeded).to.eq(true)
    expect(result.remaining[0].is('EOF')).to.eq(true)
  })

  it('parses B', function () {
    const definitions = grammar.parse(`
statement
  | :A
  | :B
  ;
    `)
    const parser = new Parser(definitions)
    const lexer = new Lexer()

    const result = parser.parse(lexer.lex('B'))

    expect(result.succeeded).to.eq(true)
    expect(result.remaining[0].is('EOF')).to.eq(true)
  })

  it('doesnt parse C', function () {
    const definitions = grammar.parse(`
statement
  | :A
  | :B
  ;
    `)
    const parser = new Parser(definitions)
    const lexer = new Lexer()

    const result = parser.parse(lexer.lex('C'))

    expect(result.succeeded).to.eq(false)
    expect(result.remaining[0].is('C')).to.eq(true)
  })
})
