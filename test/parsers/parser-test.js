const grammar = require('../../lib/grammar')
const expect = require('chai').expect
const Lexer = require('../test-lexer')
const Parser = require('../../lib/parsers/parser')
const Evaluator = require('../../lib/parsers/evaluator')

function parse (grammarString, input, options = {}) {
  const definitions = grammar.parse(grammarString)
  const parser = new Parser(definitions, options)
  const lexer = new Lexer()
  return parser.parse(lexer.lex(input))
}

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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('C')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
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
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eq(2)
    })

    it('can use names', function () {
      const definitions = grammar.parse(`
name
  | (:A as :first) then :B then (:C as :second) '[$first, $second]'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('ABC'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'C'])
    })

    it('can use names, another example', function () {
      const definitions = grammar.parse(`
statement
  | (*(:A or :B) as :name) then :C '$$ = { name: $name.join(""), c: $2 }'
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('ABBAC'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql({ name: 'ABBA', c: 'C' })
    })
  })

  describe('shortcut syntax', function () {
    it('works with opt', function () {
      const definitions = grammar.parse(`
start
  | ?:A then :B
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('B'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql([null, 'B'])
    })

    it('works with many1', function () {
      const definitions = grammar.parse(`
start
  | +:A
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('AAA'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'A', 'A'])
    })

    it('works with many0', function () {
      const definitions = grammar.parse(`
start
  | *:A then :B
  ;
      `)
      const parser = new Parser(definitions)
      const lexer = new Lexer()

      const result = parser.parse(lexer.lex('B'))

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql([[], 'B'])
    })
  })

  it('complains of left recursion, single rule', function () {
    const definitions = grammar.parse(`
A
| A then :b
;
    `)

    expect(() => new Parser(definitions)).to.throw(/A -> A/)
  })

  it('complains of left recursion, two rules', function () {
    const definitions = grammar.parse(`
A
| B
;

B
| A
;
    `)

    expect(() => new Parser(definitions)).to.throw(/A -> B -> A/)
  })

  it('complains of left recursion, multiple rules', function () {
    const definitions = grammar.parse(`
A
| B
;

B
| C
;

C
| B
;
    `)

    expect(() => new Parser(definitions)).to.throw(/B -> C -> B/)
  })

  it('complains of left recursion, multiple rules 2', function () {
    const definitions = grammar.parse(`
A
| :B
| B
;

B
| C
;

C
| A
;
    `)

    expect(() => new Parser(definitions)).to.throw(/A -> B -> C -> A/)
  })

  describe('memoization', function () {
    it('caches a parser with an input', function () {
      const result = parse(`
start
  | *:A then :B
  | *:A then :C
  ;
      `, 'AAAC', { cache: true })

      expect(result.succeeded).to.eq(true)
    })
  })

  describe('debug mode', function () {
    it('log parsing out', function () {
      const log = []
      const logger = {
        log: function (message) {
          log.push(message)
        }
      }

      parse(`
start
  | *:A then :B
  | *:A then :C
  ;
      `, 'AAAC', { debug: true, logger })

      expect(log.length).to.be.gt(0)
      expect(log).to.include('<RULE: start>: START')
      expect(log).to.include('  [THEN [MANY0 [TOKEN-PARSER A]] [TOKEN-PARSER B]]: START')
      expect(log).to.include('<RULE: start>: OK')
    })
  })
})
