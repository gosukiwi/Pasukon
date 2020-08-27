const grammar = require('../../lib/grammar')
const expect = require('chai').expect
const Lexer = require('../test-lexer')
const Parser = require('../../lib/parsers/parser')
const Evaluator = require('../../lib/parsers/evaluator')

describe('parsers/parser', function () {
  describe('unary call', function () {
    it('parses A', function () {
      const definitions = grammar.parse(`
statement
  | :A
  | :B
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('A'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
    })

    it('parses B', function () {
      const definitions = grammar.parse(`
statement
  | :A
  | :B
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('B'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
    })

    it('doesnt parse C', function () {
      const definitions = grammar.parse(`
  statement
    | :A
    | :B
    ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('C'))

      expect(result.succeeded).to.eq(false)
      expect(result.remaining[0].is('C')).to.eq(true)
    })
  })

  describe('binary call', function () {
    it('matches when it should', function () {
      const definitions = grammar.parse(`
statement
  | :A then :B
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('AB'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
    })
  })

  describe('rule call', function () {
    it('matches when it should', function () {
      const definitions = grammar.parse(`
statement
  | :A then :B
  ;

start
  | statement
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('AB'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
    })
  })

  describe('code eval', function () {
    it('evals with binary call', function () {
      const definitions = grammar.parse(`
statement
  | :A then :B '[$1, $2]'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('AB'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'B'])
    })

    it('evals with unary call', function () {
      const definitions = grammar.parse(`
statement
  | many0 :A '$1.join("")'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('AAA'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched).to.eq('AAA')
    })

    it('evals with rule call', function () {
      const definitions = grammar.parse(`
name
  | many0 :A '$1.join("")'
  ;

start
  | name '$$ = { name: $1 }'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('AAA'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched.name).to.eq('AAA')
    })

    it('evals with long chain', function () {
      const definitions = grammar.parse(`
statement
  | (many0 (:A or :B)) then :C '$1.concat($2).join("")'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('ABAC'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched).to.eq('ABAC')
    })

    it('collects values along rules', function () {
      const definitions = grammar.parse(`
name
  | many0 (:A or :B) '$$ = { type: "NAME", value: $1.join("") }'
  ;

statement
  | name then :C '$$ = { type: "STATEMENT", name: $1, b: $2 }'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('ABBAC'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched.type).to.eq('STATEMENT')
      expect(result.matched.name.type).to.eq('NAME')
      expect(result.matched.name.value).to.eq('ABBA')
      expect(result.matched.b).to.eq('C')
    })

    it('collects values when using ors', function () {
      const definitions = grammar.parse(`
name
  | many0 (:B or :C) '$$ = { type: "NAME", value: $1.join("") }'
  | many0 (:A or :B) '$$ = { type: "NAME", value: $1.join("") }'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('BBCCB'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched.type).to.eq('NAME')
      expect(result.matched.value).to.eq('BBCCB')
    })

    it('collects nested', function () {
      const definitions = grammar.parse(`
name
  | :A then :B then :C '[$1].concat($2)'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('ABC'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'B', 'C'])
    })

    it('works with a token', function () {
      const definitions = grammar.parse(`
name
  | :A '$$ = { name: $1 }'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('A'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched.name).to.eq('A')
    })

    it('can access attributes from outside', function () {
      const definitions = grammar.parse(`
name
  | :A '$.foo($1)'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      Evaluator.setContext({ foo: function () { return 2 } })
      const result = parser.parse(lexer.lex('A'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining[0].is('EOF')).to.eq(true)
      expect(result.matched).to.eq(2)
    })
  })
})
