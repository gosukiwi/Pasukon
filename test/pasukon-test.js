const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const pegjsParser = require('../lib/pegjs/grammar.js')
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
  | :A then *:B then :A 'return [$1].concat($2[0]).concat($2[1])'
  ;
    `)

    expect(pasukon.parse('ABBA')).to.eql(['A', 'B', 'B', 'A'])
  })

  it('works with custom lexer', function () {
    const pasukon = new Pasukon(`
start
  | :A then *:B then :A 'return [$1].concat($2[0]).concat($2[1])'
  ;
    `, { lexer: new Lexer() })

    expect(pasukon.parse('ABBA')).to.eql(['A', 'B', 'B', 'A'])
  })

  it('parses its own grammar syntax', function () {
    const pasukonGrammar = fs.readFileSync(path.join(__dirname, '..', 'lib', 'grammar.pasukon'))
    const pasukon = new Pasukon(pasukonGrammar, { cache: true })
    const result = pasukon.parse(pasukonGrammar)
    const pegjsResult = pegjsParser.parse(pasukonGrammar.toString())

    expect(result).to.eql(pegjsResult)
  })
})
