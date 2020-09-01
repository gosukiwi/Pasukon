const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const pegjsParser = require('../lib/pegjs/grammar.js')
const Pasukon = require('../lib/pasukon')
const Lexer = require('./test-lexer')
const UnaryCombinator = require('../lib/parsers/combinators/unary-combinator')
const BinaryCombinator = require('../lib/parsers/combinators/binary-combinator')

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
    const pasukonGrammar = fs.readFileSync(path.join(__dirname, '..', 'lib', 'grammar.pasukon')).toString()
    const pasukon = new Pasukon(pasukonGrammar, { cache: true })
    const result = pasukon.parse(pasukonGrammar)
    const pegjsResult = pegjsParser.parse(pasukonGrammar.toString())

    expect(result).to.eql(pegjsResult)
  })

  it('show the token with error when failing', function () {
    const pasukon = new Pasukon(`
start
  | :A then *:B then :A 'return [$1].concat($2[0]).concat($2[1])'
  ;
    `, { lexer: new Lexer() })

    expect(() => pasukon.parse('C')).to.throw(/<TOKEN C: 'C'>/)
  })

  it('can define a custom unary combinator', function () {
    class CustomMany1 extends UnaryCombinator {
      parse (tokens) {
        if (tokens.isEmpty()) return this.fail(tokens)

        let remaining = tokens
        let matched = []
        while (!remaining.isEmpty()) {
          const result = this.parser.parse(remaining)
          if (result.matched !== null) matched = matched.concat(result.matched)

          if (result.failed) {
            if (matched.length === 0) {
              return this.fail(tokens)
            } else {
              return this.ok(remaining, this.code ? this.eval(matched) : matched)
            }
          }

          remaining = result.remaining
        }
      }
    }

    const pasukon = new Pasukon(`
start
  | my-many1 :A 'return $1.length'
  ;
    `, { lexer: new Lexer(), combinators: { unary: { 'my-many1': CustomMany1 } } })

    expect(pasukon.parse('AAA')).to.eq(3)
  })

  it('can define a custom binary combinator', function () {
    class CustomThen extends BinaryCombinator {
      parse (tokens) {
        const lhs = this.parsers[0].parse(tokens)
        if (lhs.failed) return lhs

        const rhs = this.parsers[1].parse(lhs.remaining)
        if (rhs.succeeded) {
          rhs.matched = this.code ? this.eval(lhs.matched, rhs.matched) : [lhs.matched, rhs.matched]
          return rhs
        }

        return this.fail(tokens)
      }
    }

    const pasukon = new Pasukon(`
start
  | :A my-then :B 'return $2 + $1'
  ;
    `, { lexer: new Lexer(), combinators: { binary: { 'my-then': CustomThen } } })

    expect(pasukon.parse('AB')).to.eq('BA')
  })
})
