const expect = require('chai').expect
const Token = require('../../../lib/parsers/token')
const Then = require('../../../lib/parsers/combinators/then')
const Lexer = require('../../test-lexer')

describe('parsers/many0', function () {
  it('matches in success case', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parseB = new Token('B')
    const parser = new Then([parseA, parseB])

    const result = parser.parse(lexer.lex('AB'))

    expect(result.success).to.eq(true)
    expect(result.remaining[0].is('EOF')).to.eq(true)
  })

  it('doesnt match in invalid case', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parseB = new Token('B')
    const parser = new Then([parseA, parseB])

    const result = parser.parse(lexer.lex('AA'))

    expect(result.success).to.eq(false)
    expect(result.remaining.length).to.eq(3)
  })
})
