const expect = require('chai').expect
const Token = require('../../../lib/parsers/token-parser')
const Many1 = require('../../../lib/parsers/combinators/many1')
const Lexer = require('../../test-lexer')
const TokenList = require('../../../lib/parsers/token-list')

function lex (input) {
  return new TokenList(new Lexer().lex(input))
}

describe('parsers/many1', function () {
  it('matches many', function () {
    const parseA = new Token('A')
    const parser = new Many1(parseA)

    const result = parser.parse(lex('AAA'))

    expect(result.matched).to.eql(['A', 'A', 'A'])
    expect(result.success).to.eq(true)
    expect(result.remaining.peek('EOF')).to.eq(true)
  })

  it('doesnt match zero', function () {
    const parseA = new Token('A')
    const parser = new Many1(parseA)

    const result = parser.parse(lex('B'))

    expect(result.success).to.eq(false)
    expect(result.remaining.peek('B')).to.eq(true)
  })
})
