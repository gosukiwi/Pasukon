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

    expect(pasukon.parse('ABBA').matched).to.eql(['A', 'B', 'B', 'A'])
  })

  it('works with custom lexer', function () {
    const pasukon = new Pasukon(`
start
  | :A then *:B then :A '$$ = [$1].concat($2[0]).concat($2[1])'
  ;
    `, { lexer: new Lexer() })

    expect(pasukon.parse('ABBA')).to.eql(['A', 'B', 'B', 'A'])
  })

  it.only('parses its own grammar syntax', function () {
    const pasukon = new Pasukon(`
lex
  match  LEX_CLOSE      '/lex'
  match  LEX_OPEN       'lex'
  match  MATCH          'match'
  match  IGNORE         'ignore'
  match  MATCHER_SIMPLE /^'[^']*'/
  match  NAME           /^[a-zA-Z][a-zA-Z0-9_-]*/
  ignore WHITESPACE     /^\\s+/
/lex

token-action
  | :MATCH
  | :IGNORE
  ;

token-matcher
  | :MATCHER_SIMPLE
  ;

token-definition
  | token-action then :NAME then token-matcher
  ;

lex
  | :LEX_OPEN then token-definition then :LEX_CLOSE
  ;

start
  | lex
  ;
    `)

    const result = pasukon.parse(`
lex
  match FOO BAR
/lex
    `.trim())
    console.log(result)

    expect(result).to.eq('FOO')
  })
})
