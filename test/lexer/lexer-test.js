const Lexer = require('../../lib/lexer/lexer')
const selfparse = require('../../lib/self-parse')
const expect = require('chai').expect

describe('lexer/lexer', function () {
  it('scans literal', function () {
    const definitions = selfparse(`
lex
  match A 'A'
  match ASD /asd/
/lex
    `)

    const lexer = new Lexer(definitions[0].tokens)
    const tokens = lexer.lex('AasdA')

    expect([...tokens].map((t) => t.name)).to.eql(['A', 'ASD', 'A', 'EOF'])
  })

  it('can ignore tokens', function () {
    const definitions = selfparse(`
lex
  match  A 'A'
  ignore B 'B'
  ignore C /C+/
/lex
    `)

    const lexer = new Lexer(definitions[0].tokens)
    const tokens = lexer.lex('ABACCC')

    expect([...tokens].map((t) => t.name)).to.eql(['A', 'A', 'EOF'])
  })

  it('saves positions', function () {
    const definitions = selfparse(`
lex
  match  A        'A'
  ignore NEWLINE  '\n'
  ignore B        'B'
/lex
    `)

    const lexer = new Lexer(definitions[0].tokens)
    const tokens = [...lexer.lex('AB\nBA\n\nA\n\nA')]

    expect(tokens[0].line).to.eq(1)
    expect(tokens[0].col).to.eq(1)
    expect(tokens[1].line).to.eq(2)
    expect(tokens[1].col).to.eq(2)
    expect(tokens[2].line).to.eq(4)
    expect(tokens[2].col).to.eq(1)
    expect(tokens[3].line).to.eq(6)
    expect(tokens[3].col).to.eq(1)
  })

  it('reports the position when failing', function () {
    const definitions = selfparse(`
lex
  match  A        'A'
/lex
    `)

    const lexer = new Lexer(definitions[0].tokens)

    expect(() => [...lexer.lex('AAB')]).to.throw(/at line 1, column 3/)
  })
})
