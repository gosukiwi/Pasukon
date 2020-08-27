const expect = require('chai').expect
const Token = require('../../../lib/parsers/token')
const Many1 = require('../../../lib/parsers/combinators/many1')
const Lexer = require('../../test-lexer')

describe('parsers/many1', function () {
  it('matches many', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parser = new Many1(parseA)

    const result = parser.parse(lexer.lex('AAA'))

    expect(result.success).to.eq(true)
    expect(result.remaining[0].is('EOF')).to.eq(true)
  })

  it('doesnt match zero', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parser = new Many1(parseA)

    const result = parser.parse(lexer.lex('B'))

    expect(result.success).to.eq(false)
    expect(result.remaining[0].is('B')).to.eq(true)
  })
})
