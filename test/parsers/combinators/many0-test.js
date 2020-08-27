const expect = require('chai').expect
const Token = require('../../../lib/parsers/token')
const Many0 = require('../../../lib/parsers/combinators/many0')
const Lexer = require('../../test-lexer')

describe('parsers/many0', function () {
  it('works', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parser = new Many0(parseA)

    const result = parser.parse(lexer.lex('AAA'))

    expect(result.success).to.eq(true)
    expect(result.remaining[0].is('EOF')).to.eq(true)
  })
})
