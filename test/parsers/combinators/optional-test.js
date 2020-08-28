const expect = require('chai').expect
const Token = require('../../../lib/parsers/token-parser')
const Optional = require('../../../lib/parsers/combinators/optional')
const Lexer = require('../../test-lexer')
const TokenList = require('../../../lib/parsers/token-list')

function lex (input) {
  return new TokenList(new Lexer().lex(input))
}

describe('parsers/optional', function () {
  it('can match nothing', function () {
    const parseA = new Token('A')
    const parser = new Optional(parseA)

    const result = parser.parse(lex('B'))

    expect(result.success).to.eq(true)
    expect(result.matched).to.eq(null)
    expect(result.remaining.peek('B')).to.eq(true)
  })

  it('can match something', function () {
    const parseA = new Token('A')
    const parser = new Optional(parseA)

    const result = parser.parse(lex('AB'))

    expect(result.success).to.eq(true)
    expect(result.remaining.peek('B')).to.eq(true)
  })
})
