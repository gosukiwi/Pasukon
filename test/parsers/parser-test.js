const selfparse = require('../../lib/self-parse')
const chai = require('chai')
chai.use(require('chai-string'))
const expect = chai.expect
const Lexer = require('../test-lexer')
const Parser = require('../../lib/parsers/parser')
const Evaluator = require('../../lib/parsers/evaluator')

function parse (grammarString, input, options = {}) {
  const definitions = selfparse(grammarString)
  options.lexer = new Lexer()
  const parser = new Parser(definitions, options)
  return parser.parse(input)
}

describe('parsers/parser', function () {
  describe('unary call', function () {
    it('parses A', function () {
      const result = parse(`
statement
  | :A
  | :B
  ;
      `, 'A')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
    })

    it('parses B', function () {
      const result = parse(`
statement
  | :A
  | :B
  ;
      `, 'B')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
    })

    it('doesnt parse C', function () {
      const result = parse(`
  statement
    | :A
    | :B
    ;
      `, 'C')

      expect(result.succeeded).to.eq(false)
      expect(result.remaining.peek('C')).to.eq(true)
    })
  })

  describe('binary call', function () {
    it('matches when it should', function () {
      const result = parse(`
statement
  | :A then :B
  ;
      `, 'AB')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
    })
  })

  describe('rule call', function () {
    it('matches when it should', function () {
      const result = parse(`
statement
  | :A then :B
  ;

start
  | statement
  ;
      `, 'AB')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
    })
  })

  describe('code eval', function () {
    it('evals with binary call', function () {
      const result = parse(`
statement
  | :A then :B 'return [$1, $2]'
  ;
      `, 'AB')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'B'])
    })

    it('evals with unary call', function () {
      const result = parse(`
statement
  | many0 :A 'return $1.join("")'
  ;
      `, 'AAA')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eq('AAA')
    })

    it('evals with rule call', function () {
      const result = parse(`
name
  | many0 :A 'return $1.join("")'
  ;

start
  | name 'return { name: $1 }'
  ;
      `, 'AAA')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched.name).to.eq('AAA')
    })

    it('evals with long chain', function () {
      const result = parse(`
statement
  | (many0 (:A or :B)) then :C 'return $1.concat($2).join("")'
  ;
      `, 'ABAC')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eq('ABAC')
    })

    it('collects values along rules', function () {
      const result = parse(`
name
  | many0 (:A or :B) 'return { type: "NAME", value: $1.join("") }'
  ;

statement
  | name then :C 'return { type: "STATEMENT", name: $1, b: $2 }'
  ;
      `, 'ABBAC')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched.type).to.eq('STATEMENT')
      expect(result.matched.name.type).to.eq('NAME')
      expect(result.matched.name.value).to.eq('ABBA')
      expect(result.matched.b).to.eq('C')
    })

    it('collects values when using ors', function () {
      const result = parse(`
name
  | many0 (:B or :C) 'return { type: "NAME", value: $1.join("") }'
  | many0 (:A or :B) 'return { type: "NAME", value: $1.join("") }'
  ;
      `, 'BBCCB')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched.type).to.eq('NAME')
      expect(result.matched.value).to.eq('BBCCB')
    })

    it('collects nested', function () {
      const result = parse(`
name
  | :A then :B then :C 'return [$1].concat($2)'
  ;
      `, 'ABC')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'B', 'C'])
    })

    it('works with a token', function () {
      const result = parse(`
name
  | :A 'return { name: $1 }'
  ;
      `, 'A')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched.name).to.eq('A')
    })

    it('can use context', function () {
      Evaluator.setContext({ foo: function () { return 2 } })
      const result = parse(`
name
  | :A 'return $ctx.foo($1)'
  ;
      `, 'A')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eq(2)
    })

    it('can use names', function () {
      const result = parse(`
name
  | (:A as :first) then :B then (:C as :second) 'return [$.first, $.second]'
  ;
      `, 'ABC')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'C'])
    })

    it('can use names, another example', function () {
      const result = parse(`
statement
  | (*(:A or :B) as :name) then :C 'return { name: $.name.join(""), c: $2 }'
  ;
      `, 'ABBAC')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql({ name: 'ABBA', c: 'C' })
    })
  })

  describe('shortcut syntax', function () {
    it('works with opt', function () {
      const result = parse(`
start
  | ?:A then :B
  ;
      `, 'B')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql([null, 'B'])
    })

    it('works with many1', function () {
      const result = parse(`
start
  | +:A
  ;
      `, 'AAA')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql(['A', 'A', 'A'])
    })

    it('works with many0', function () {
      const result = parse(`
start
  | *:A then :B
  ;
      `, 'B')

      expect(result.succeeded).to.eq(true)
      expect(result.remaining.peek('EOF')).to.eq(true)
      expect(result.matched).to.eql([[], 'B'])
    })
  })

  it('complains of left recursion, single rule', function () {
    expect(() => parse(`
A
| A then :b
;
    `)).to.throw(/A -> A/)
  })

  it('complains of left recursion, two rules', function () {
    expect(() => parse(`
A
| B
;

B
| A
;
    `)).to.throw(/A -> B -> A/)
  })

  it('complains of left recursion, multiple rules', function () {
    expect(() => parse(`
A
| B
;

B
| C
;

C
| B
;
    `)).to.throw(/B -> C -> B/)
  })

  it('complains of left recursion, multiple rules 2', function () {
    expect(() => parse(`
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
    `)).to.throw(/A -> B -> C -> A/)
  })

  describe('memoization', function () {
    it('caches a parser with an input', function () {
      const log = []
      const logger = {
        log: function (message) {
          log.push(message)
        }
      }

      const result = parse(`
name
  | *:A '$1.join("")'
  | *:B
  ;

start
  | name then :B
  | name then :C
  ;
      `, 'AAAC', { cache: true, debug: true, logger })

      expect(result.succeeded).to.eq(true)
      expect(log.join('')).to.have.entriesCount('[TOKEN A]: START', 4)
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
      expect(log).to.include('  [THEN [MANY0 [TOKEN A]] [TOKEN B]]: START')
      expect(log).to.include('<RULE: start>: OK')
    })
  })
})
