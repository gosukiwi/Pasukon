const expect = require('chai').expect
const Token = require('../../../lib/parsers/token-parser')
const Many0 = require('../../../lib/parsers/combinators/many0')
const Lexer = require('../../test-lexer')
const TokenList = require('../../../lib/parsers/token-list')

function lex (input) {
  return new TokenList(new Lexer().lex(input))
}

describe('parsers/many0', function () {
  it('matches many', function () {
    const parseA = new Token('A')
    const parser = new Many0(parseA)

    const result = parser.parse(lex('AAA'))

    expect(result.matched).to.eql(['A', 'A', 'A'])
    expect(result.success).to.eq(true)
    expect(result.remaining.peek('EOF')).to.eq(true)
  })

  it('matches zero', function () {
    const parseA = new Token('A')
    const parser = new Many0(parseA)

    const result = parser.parse(lex('B'))

    expect(result.success).to.eq(true)
    expect(result.remaining.peek('B')).to.eq(true)
  })
})
