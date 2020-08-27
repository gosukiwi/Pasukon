# Pasukon
Pasukon generates parsers based on a relatively easy to learn grammar.

It's based on parser combinators, but it's not a pure parser combinator, as it
requires a lexing step for performance reasons.

It allows you to define your own lexer and combinators if needed.

# Concepts
__Parser__: A function that takes an array of tokens as input and returns a
`Result` object.

__Result__: An object that reports whether the match was successful or not. It
exposes a `remaining` property with the remaining of the given input, and also a
`code` property which is optional. If present, it will invoke the given code
snippet if the match succeeded and store the results in the `matched` field. If
no code is given, it will fill `matched` in a default way.

__Combinator__: Takes one or more parsers and returns a new parser, combining
them in some way. For example, `then` takes two parsers and creates a new one,
matching one, and then the other. `many0` takes one parser and matches it zero
or more times.

# Syntax
Below is a cheatsheet of the syntax used to generate a parser:

## Lexer
Optionally, you can define a lexer inside a `lex`-`/lex` block. In the format
`<token-name> <matcher>`.

```
lex
  A 'A'
  Identifier /[a-zA-Z]/
/lex
```

It supports two different matchers, the first one just compares by string using
`startswith`. The second uses regex, and matches the input against it. It
returns  true only if the input starts with the given regex, that is, it has
matched and the index is 0.

For more complex lexers, you can build your own. All it needs is an object that
implements `lex(input)` and returns an array of `Token`.

The `Token` value object class lives in `lib/lexer/token` and it is really
simple. It only implements an `is` method to compare it. Eg:
`token.is('NEWLINE')`.

You can use your own `Token` implementation or the one provided by this library.
Up to you.

## Grammar
In it's simplest form, the grammar looks like this:

```
<rule-name>
  | <rule-body>
  | <another-rule-body>
  ;
```

Each rule returns a parser, which can be used by other rules and combinators.
You can use the built-in `token` parser to match a single token:

```
program
  | token a
  ;
```

That will make a new parser, called `program`, that will call the `token`
built-in parser with the argument `a`. Now the `program` parser will match a
single instance of the token `a`.

The token parser is special, because it uses tokens as parameters, instead of
other parsers.

There are three ways of calling parsers. _Unary Call_:

```
program
  | many0 (token a)
```

_Binary Call_:

```
program
  | (token a) or (token b)
  ;
```

And _Rule Call_:

```
program
  | (token a) or (token b)
  ;

start
  | program
  ;
```

A rule can be composed of any combination of those methods:

```
program
  | (many0 (token a) or (token b))
  | (token a) or ((token b) or (token c))
  ;
```

Notice that no matter how nested it is, an outmost rule is always either in
__unary__ format, or __binary__ format (unless it's just a simple rule call).
This is important for using code evaluation later on.

Another important thing to note is the use parentheses. Binary combinators all
have the same priority so they are always executed from left to right:

```
program
  | (token a) or (token b) or (token c)
  // is the same as
  | (token a) or ((token b) or (token c))
  ;
```

If you need to change the priority, simply use parentheses. It's recommended to
always use them to make things clear, and try to keep rules short using
composition.

## Syntactic Sugar 🍬
The grammar syntax provides some sugar 🍬 to make things easier. The most common
is `|`:

```
program
  | (token a) or (token b)
  ;
// is the same as
program
  | token a
  | token b
  ;
```

Also, most built-in unary parsers have a _shortcut syntax_. For example, you can
use `:` to use the token parser:

```
program
  | :a
  | :b
  ;
```

The shortcut syntax has high priority, so it can go anywhere and there's no need
for parentheses:

```
program
  | opt :a // this is a unary call to the `opt` parser
  | opt token a // this is a binary call to the `token` parser, which is not what we want, and is invalid
  ;
```

Below are all the unary parsers shortcuts:

* `*` for `many0`
* `+` for `many1`
* `?` for `opt`
* `:` for `token`

Putting it all together:

```
statement
  | :A then ?(:B or :C)
  | :D
  ;

statements
  | *statement
  ;
```

The last rule will be considered the __starting rule__. All rules must be
defined before using them in another rule.

## Evaluating Code
Rules can optionally evaluate some code:

```
statement
  | :A then ?(:B or :C) '$$ = { type: 'FOO', first: $1, second: $2 }'
  | :D
  ;
```

Only the outermost call evaluates the code. Binary calls populate two variables:
`$1` and `$2`, which is the match of the left hand side and right hand side
respectively. Unary or rule calls only populate `$1`.

You can build up complex results from simple ones as such:

```
name
  | many0 (:A or :B) '$$ = { type: "NAME", value: $1.join("") }'
  ;

statement
  | name then :C '$$ = { type: "STATEMENT", name: $1, b: $2 }'
  ;
```

## Injecting your own

```
Evaluator.setContext({ foo: function () { return 2 } })
```

You can then access it using `$`:

```
name
  | :A '$.foo($1)'
  ;
```

The rule above will return `2` if it matches, because `$.foo` returns `2`.

# Programmatic Usage

```javascript
const result = new Pasukon('grammar.g').parse('input')
// if you want to use your own lexer
const result = new Pasukon('grammar.g', new MyLexer()).parse('input')
```

See [Lexer](#lexer) for more info on how the lexer works.

# Available Combinators
Unary combinators: `many0`; `many1`; `opt`.

Binary combinators: `then`; `or`.

# Adding Your Own
You can add your own combinators as such:

```javascript
const Parser = require('parser-combinator').Parser
const lexer = ...
const parser = new Parser(lexer.lex('my input'))
parser.addUnaryCombinator('combinatorName', MyCombinatorClass)
parser.addBinaryCombinator('otherName', SomeBinaryCombinator)
```

Unary combinators take a single argument, a parser, in the constructor. Binary
combinators take an array of two parsers.

They must implement a `parse` method and return a `Result` object. You can see
example combinators in `./lib/parsers/combinators`.

# Development
Regenerate the PEGJS grammar with

    npm run grammar

Run tests with

    npm run test

Watch tests with

    npm run watch
