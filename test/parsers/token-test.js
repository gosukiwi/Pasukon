const expect = require('chai').expect
const Token = require('../../lib/parsers/token')
const Lexer = require('../test-lexer')

describe('parsers/token-parser', function () {
  it('matches a proper token', function () {
    const lexer = new Lexer()
    const parser = new Token('A')

    const result = parser.parse(lexer.lex('A'))

    expect(result.success).to.eq(true)
    expect(result.remaining[0].is('EOF')).to.eq(true)
  })

  it('doesnt match other tokens', function () {
    const lexer = new Lexer()
    const parser = new Token('A')

    const result = parser.parse(lexer.lex('B'))

    expect(result.success).to.eq(false)
    expect(result.remaining[0].is('B')).to.eq(true)
  })
})
