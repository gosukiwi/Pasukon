const Benchmark = require('benchmark')
const Pasukon = require('../../lib/pasukon')
const pegjsParser = require('../../lib/pegjs/grammar.js')
const suite = new Benchmark.Suite()

const grammar = `
lex
  match  LEX_CLOSE      '/lex'
  match  LEX_OPEN       /^lex\\s+/
  match  MATCH          /^match\\s+/
  match  IGNORE         'ignore'
  match  COLON          ':'
  match  SEMICOLON      ';'
  match  PIPE_ARROW     '|>'
  match  PIPE           '|'
  match  POPEN          '('
  match  PCLOSE         ')'
  match  QUESTION_MARK  '?'
  match  PLUS           '+'
  match  TIMES          '*'
  match  REGEX_MATCHER  {^/[^/]*/}
  match  REGEX_MATCHER  /^{[^}]*}/
  match  CODE           /^'[^']*'/
  match  CODE           /^"[^"]*"/
  match  NAME           /^[a-zA-Z][a-zA-Z0-9_-]*/
  ignore WHITESPACE     /^\\s+/
/lex

token-action
  | :MATCH '$1.trim()'
  | :IGNORE
  ;

token-matcher
  | :CODE
  |> '$$ = { type: "TOKEN_MATCHER", match: $1.substring(1, $1.length - 1) }'
  | :REGEX_MATCHER
  |> '$$ = { type: "TOKEN_REGEX_MATCHER", regex: $1.substring(1, $1.length - 1) }'
  ;

token-definition
  | (token-action as :action) then (:NAME as :name) then (token-matcher as :matcher)
  |> '$$ = { type: "TOKEN_DEFINITION", name: $name, matcher: $matcher, action: $action }'
  ;

lexer
  | :LEX_OPEN then (*token-definition as :tokens) then :LEX_CLOSE '$$ = { type: "LEXER", tokens: $tokens }'
  ;

parser-name
  | :POPEN then (rule-expression as :expr) then :PCLOSE
  |> '$expr'
  | :QUESTION_MARK then (parser-name as :arg)
  |> '$$ = { type: "UNARY_CALL", parser: "opt", arg: $arg }'
  | :PLUS then (parser-name as :arg)
  |> '$$ = { type: "UNARY_CALL", parser: "many1", arg: $arg }'
  | :TIMES then (parser-name as :arg)
  |> '$$ = { type: "UNARY_CALL", parser: "many0", arg: $arg }'
  | :COLON then (parser-name as :arg)
  |> '$$ = { type: "UNARY_CALL", parser: "token", arg: $arg }'
  | :NAME
  |> '$$ = { type: "RULE_CALL", name: $1 }'
  ;

rule-expression
  | (parser-name as :lhs) then (:NAME as :parser) then (rule-expression as :rhs)
  |> '$$ = { type: "BINARY_CALL", parser: $parser, lhs: $lhs, rhs: $rhs }'
  | (:NAME as :name) then (rule-expression as :arg)
  |> '$$ = { type: "UNARY_CALL", parser: $name, arg: $arg }'
  | parser-name
  ;

rule-eval
  | ?:PIPE_ARROW then (:CODE as :code) '$$ = $code.substring(1, $code.length - 1)'
  ;

rule-definition
  | :PIPE then (rule-expression as :expr) then ?(rule-eval as :code)
  |> '$code ? $expr.code = $code : null; $expr'
  ;

rule
  | (:NAME as :name) then (+rule-definition as :definitions) then :SEMICOLON
  |> '$$ = { type: "RULE", name: $name, definitions: $definitions }'
  ;

rules
  | *rule
  ;

start
  | (lexer as :lexer) then (rules as :rules) '[$lexer].concat($rules)'
  | rules
  ;
    `.trim()

const pasukon = new Pasukon(grammar, { cache: false })
const pasukonWithCache = new Pasukon(grammar, { cache: true })
// add tests
suite
  .add('Pasukon', function () {
    pasukon.parse(grammar)
  })
  .add('Pasukon (cache enabled)', function () {
    pasukonWithCache.parse(grammar)
  })
  .add('PEGjs', function () {
    pegjsParser.parse(grammar)
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
