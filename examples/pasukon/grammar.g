lex
  match  lex_close  '/lex'
  match  lex_open   'lex'
  match  match      'match'
  match  ignore     'ignore'
  match  name       /^[a-zA-Z][a-za-z0-9_-]*/
  ignore whitespace /^\s+/
/lex

lex-body
  | :match then :name then :name
  ;

start
  | :name
  ;
