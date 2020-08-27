# Parser Combinator
Not a pure parser combinator, as it requires a lexing step for performance
reasons. But it does allow you to define a language by combining parsers.

# Concepts
__Parser__: A function that takes an array of tokens as input and returns a
`Result` object, which reports whether the match was successful or not. It also
exposes a `remaining` property with the remaining of the given input.

__Combinator__: Takes one or more parsers and returns a new parser, combining
both in some way. For example, `then` takes two parsers and creates a new one,
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
<my-new-parser>
  | <parser-name>
  ;
```

It will generate a new parser called `my-new-parser` and that parser will simply
call `parser-name`.

You can use the built-in `token` parser to match a single token:

```
program
  | token a
  ;
```

That will make a new parser, called `program`, that will call the `token` parser
with the argument `a`.

The token parser is special, because it uses tokens as parameters, instead of
other parsers.

Calling one parser followed by another is called _Unary Call_.

Another way to invoke parsers is _Binary Call_:

```
program
  | (token a) or (token b)
  ;
```

The above will call the binary parser `or` (because it takes two parsers as
input, left-hand-side and right-hand-side) with the two token parsers.

Notice that we have to use parentheses, otherwise the parser would think it
looks like this:

```
program
  | token a (or token b)
  ;
```

Which is not at all what we want. There grammar provides some sugar to work
around this. The above is equivalent to this:

```
program
  | token a
  | token b
  ;
```

So `|` is calling the `or` parser under the hood. Also, you can use `:` to
use the token parser:

```
program
  | :a
  | :b
  ;
```

Because the shortcut syntax has high priority, you can also express it like
this:

```
program
  | :a or :b
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

The last rule will be considered the __starting rule__. The grammar must be
defined from more specific to more generic.

## Evaluating Code
Rules can optionally evaluate some code:

```
statement
  | :A then ?(:B or :C) '$$ = { type: 'FOO', first: $1, second: $2 }'
  | :D
  ;
```

Only the outermost parser evaluates the code, and at most, it has two variables
to access it's data: `$1` and `$2`. If it's a unary combinator or a single
parser, it will only populate `$1`.

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
