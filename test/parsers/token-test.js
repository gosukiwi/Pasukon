const expect = require('chai').expect
const Token = require('../../lib/parsers/token-parser')
const Lexer = require('../test-lexer')
const TokenList = require('../../lib/parsers/token-list')

function lex (input) {
  return new TokenList(new Lexer().lex(input))
}

describe('parsers/token-parser', function () {
  it('matches a proper token', function () {
    const parser = new Token('A')

    const result = parser.parse(lex('A'))

    expect(result.success).to.eq(true)
    expect(result.remaining.peek('EOF')).to.eq(true)
  })

  it('doesnt match other tokens', function () {
    const parser = new Token('A')

    const result = parser.parse(lex('B'))

    expect(result.success).to.eq(false)
    expect(result.remaining.peek('B')).to.eq(true)
  })
})
