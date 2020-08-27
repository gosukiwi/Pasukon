const expect = require('chai').expect
const Token = require('../../../lib/parsers/token')
const Optional = require('../../../lib/parsers/combinators/optional')
const Lexer = require('../../test-lexer')

describe('parsers/many0', function () {
  it('can match nothing', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parser = new Optional(parseA)

    const result = parser.parse(lexer.lex('B'))

    expect(result.success).to.eq(true)
    expect(result.matched).to.eq(null)
    expect(result.remaining[0].is('B')).to.eq(true)
  })

  it('can match something', function () {
    const lexer = new Lexer()
    const parseA = new Token('A')
    const parser = new Optional(parseA)

    const result = parser.parse(lexer.lex('AB'))

    expect(result.success).to.eq(true)
    expect(result.remaining[0].is('B')).to.eq(true)
  })
})
