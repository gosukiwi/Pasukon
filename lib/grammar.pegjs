Grammar
  = lex:Lex _ rules:Rules { return [lex].concat(rules) }
  / Rules

// Lexer
Lex
  = _ "lex" _ tokens:TokenDefinition* _ "/lex" _ { return { type: 'LEXER', tokens } }

TokenDefinition
  = name:Name __ matcher:TokenMatcher _ { return { type: 'TOKEN_DEFINITION', name, matcher } }

TokenMatcher
  = "'" matcher:[^']* "'" { return { type: 'TOKEN_MATCHER', match: matcher.join('') } }
  / "/" matcher:[^/]* "/" { return { type: 'TOKEN_REGEX_MATCHER', regex: matcher.join('') } }

// Rules
Rules
  = Rule*

Rule
  = _ name:Name __ definitions:RuleDefinition* ";" _
    { return { type: 'RULE', name, definitions } }

RuleDefinition
  = "|" __ expr:RuleExpression _ code:RuleEval? _ { code ? expr.code = code : null; return expr }

RuleEval
  = "'" code:[^']* "'" { return code.join('') }

RuleExpression
  = lhs:ParserName __ parser:Name __ rhs:RuleExpression // Binary Call
    { return { type: 'BINARY_CALL', parser, lhs, rhs } }
  / name:Name __ arg:RuleExpression // Unary Call
    { return { type: 'UNARY_CALL', parser: name, arg } }
  / parser:ParserName // Simple Call
    { return parser }

ParserName
  = "(" _ expr:RuleExpression _ ")" { return expr }
  // Shortcuts for unaries
  / "?" _ arg:ParserName // sugar for opt
    { return { type: 'UNARY_CALL', parser: 'opt', arg } }
  / "+" _ arg:ParserName // sugar for many1
    { return { type: 'UNARY_CALL', parser: 'many1', arg } }
  / "*" _ arg:ParserName // sugar for many0
    { return { type: 'UNARY_CALL', parser: 'many0', arg } }
  / ":" _ arg:ParserName // sugar for many0
    { return { type: 'UNARY_CALL', parser: 'token', arg } }
  / name:Name
    { return { type: 'RULE_CALL', name } }

// Util
Name
  = [a-zA-Z][a-zA-Z0-9_-]* { return text() }

Comment
  = "//" [^\n]*

_ "whitespace"
  = [ \t\n\r]* Comment _
  / [ \t\n\r]*

__ "mandatory whitespace"
  = [ \t\n\r] _
