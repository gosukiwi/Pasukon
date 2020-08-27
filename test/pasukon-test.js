const expect = require('chai').expect
const Pasukon = require('../lib/pasukon')
const Lexer = require('./test-lexer')

describe('Pasukon', function () {
  it('works with built-in lexer', function () {
    const pasukon = new Pasukon(`
lex
  match A 'A'
  match B 'B'
/lex

start
  | :A then *:B then :A '$$ = [$1].concat($2[0]).concat($2[1])'
  ;
    `)

    expect(pasukon.parse('ABBA')).to.eql(['A', 'B', 'B', 'A'])
  })

  it('works with custom lexer', function () {
    const pasukon = new Pasukon(`
start
  | :A then *:B then :A '$$ = [$1].concat($2[0]).concat($2[1])'
  ;
    `, new Lexer())

    expect(pasukon.parse('ABBA')).to.eql(['A', 'B', 'B', 'A'])
  })
})
