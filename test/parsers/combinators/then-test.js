const expect = require('chai').expect
const Token = require('../../../lib/parsers/token-parser')
const Then = require('../../../lib/parsers/combinators/then')
const Lexer = require('../../test-lexer')
const TokenList = require('../../../lib/parsers/token-list')

function lex (input) {
  return new TokenList(new Lexer().lex(input))
}

describe('parsers/then', function () {
  it('matches in success case', function () {
    const parseA = new Token('A')
    const parseB = new Token('B')
    const parser = new Then([parseA, parseB])

    const result = parser.parse(lex('AB'))

    expect(result.success).to.eq(true)
    expect(result.remaining.peek('EOF')).to.eq(true)
  })

  it('doesnt match in invalid case', function () {
    const parseA = new Token('A')
    const parseB = new Token('B')
    const parser = new Then([parseA, parseB])

    const result = parser.parse(lex('AA'))

    expect(result.success).to.eq(false)
    expect(result.remaining.peek('A')).to.eq(true)
  })
})
