const expect = require('chai').expect
const Token = require('../../../lib/parsers/token-parser')
const As = require('../../../lib/parsers/combinators/as')
const Lexer = require('../../test-lexer')
const TokenList = require('../../../lib/parsers/token-list')

function lex (input) {
  return new TokenList(new Lexer().lex(input))
}

describe('parsers/as', function () {
  it('wraps the result', function () {
    const parseA = new Token('A')
    const parser = new As([parseA, { tokenName: 'foo' }])

    const result = parser.parse(lex('A'))

    expect(result.success).to.eq(true)
    expect(result.matched).to.eql({ name: 'foo', value: 'A' })
  })
})
