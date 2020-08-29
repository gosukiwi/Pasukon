# Pasukon
Pasukon generates parsers based on a relatively easy to learn grammar. It's
based on parser combinators, and also implements a lexing step.

It is highly extensible (you can make your own lexer and combinators), has no
dependencies, and works on Node and Browser.

# Why
I love [PEG.js](https://pegjs.org), but it's designed to be used for prototyping
and, without caching, it really struggles to parse big grammars. Sometimes you
can't use caching, particularly in indent-based grammars.

[Jison](https://zaa.ch/jison/) is great, but the documentation is not that good
and it's not easy to get started. Besides, it seems that it's not maintained
anymore.

[Nearley](https://nearley.js.org/) looks like the most mature solution at the
moment, but it's also not easy to get started.

Pasukon covers a middle ground. It's designed to be simple to learn, use and
extend. Not the fastest, but fast enough.

The grammar has a few simple rules and everything is built upon that. There's no
left-recursion elimination or operator precedence. Instead, you need to define
rules in the proper order (like PEG parsers).

It's like the _Go_ programming language in a sense. Simple. So simple it might
make some things tricky. But when it's the right tool for the job, it sure is
great.

# Concepts
__Parser__: A function that takes an array of tokens as input and returns a
`Result` object.

__Result__: An object that reports whether the match was successful or not. It
exposes a `remaining` property with the remaining of the given input.

__Combinator__: Takes one or more parsers and returns a new parser, combining
them in some way. For example, `then` takes two parsers and creates a new one,
matching one, and then the other. `many0` takes one parser and matches it zero
or more times.

# Syntax
Below is a cheatsheet of the syntax used to generate a parser:

## Lexer
Optionally, you can define a lexer inside a `lex`-`/lex` block. In the format
`[match|ignore] <token-name> <matcher>`.

```
lex
  match  DEF        'def'
  match  IDENTIFIER /^[a-zA-Z]/
  match  NEWLINE    /^\n/
  ignore WHITESPACE /^[ \t\r]+/
/lex
```

It supports two different matchers, the first one just compares by string using
`startsWith`. The second uses regex, and matches the input against it. It
returns  true only if the input starts with the given regex, that is, it has
matched and the index is 0.

For performance reason, it's a good idea to start all regexes with `^` so the
regex engine can stop as soon as possible.

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
  ;
```

_Binary Call_:

```
program
  | (token a) or (token b)
  ;
```

And _Rule Call_:

```
start
  | another-rule
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
__unary__, __binary__, or __rule call__ format.

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
always use them in non-trivial rules to make things clear.

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

The last rule will be considered the __starting rule__.

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

> __NOTE__ In the above code execution, the variable `$$` is arbitrary. Because
> `eval` does not return a literal object, we need to wrap it in an assignment
> in order for it to return. You could use any variable name you want in there.
> By convention, `$$` is used.

You can build up complex results from simple ones as such:

```
name
  | many0 (:A or :B) '$$ = { type: "NAME", value: $1.join("") }'
  ;

statement
  | name then :C '$$ = { type: "STATEMENT", name: $1, c: $2 }'
  ;
```

To make things easier to manage, you can use the special `as` combinator, which
takes a parser on the left hand side, and a token on the right hand side. Then
it will __give you access to a variable of the same name__ when evaluating code:

```
statement
  | (*(:A or :B) as :name) then :C '$$ = { type: "STATEMENT", name: $name.join(""), c: $2 }'
  ;
```

## Left Recursion
You have to be careful when defining rules that they are not left-recursive.
That means, a rule cannot match itself first. It needs to match other things
first.

```
// left recursion infinite loop
start
  | start
  ;

// this is fine
start
  | :a start
  ;
```

It also applies to rules that call other rules.

```
// left recursion infinite loop
// because `RULE_B` starts with `RULE_A` and `RULE_A` starts with `RULE_B`
RULE_A
  | RULE_B
  ;

RULE_B
  | RULE_A
  ;
```

The parser will check for left-recursion and fail if it can find it.

## Operator Precedence
Say you want to match `+`, `-` first, then `*` and `/`. Here's an example on how
to do it:

```
TODO
```

# Programmatic Usage
The basic usage is simply instantiating `Pasukon` with a grammar string as first
argument, and an optional hash with options:

```javascript
const parser = new Pasukon('...', { debug: true })
const result = parser.parse('some input')
```

Here's a more complete example:
```javascript
const result = new Pasukon(`
lex
  match A 'A'
  match B 'B'
/lex

start
  | :A or :B
  ;
`).parse('A')

// More likely you'll read the grammar from a file
const result = new Pasukon(fs.readFileSync('grammar.g')).parse('input')
// Or if you want to use your own lexer
const result = new Pasukon(fs.readFileSync('grammar.gs'), { lexer: new MyLexer() }).parse('input')
```

See [Lexer](#lexer) for more info on how the lexer works.

## Options
The options object can define:

* `lexer`: An instance of a Lexer to be used by the parser. Default: `undefined`. If none specified, it will use the built-in lexer in the grammar.
* `cache`: Boolean. Default: `false`. When `true`, it will cache the parsers results.
* `start`: String. Default: `null`. When given, it will start the parsing process from the specified rule.
* `debug`: Boolean. Default: `false`. When `true`, it will use the logger to log each parsing step.
* `logger`: Default: `null`. If specified, it will use this logger when debugging. A logger only needs a `log(string)` method.

```javascript
const result = new Pasukon('...', { cache: true, start: 'some_rule' }).parse('input')
```

# [TODO] CLI Usage
You can generate a pre-compiled grammar as such:

    npx pasukon -o parser.js grammar.g

That will generate a `parser.js` file that you can just use:

```javascript
const parser = require('parser')
const result = parser.parse('my input')
```

## Using The Context
You can add to the context in which the code in grammars get evaluated.

```
Evaluator.setContext({ foo: function () { return 2 } })
const result = new Pasukon('grammar.g').parse('input')
```

You can then access the context using `$`:

```
name
  | :A '$.foo($1)'
  ;
```

The rule above will return `2` if it matches, because `$.foo` returns `2`. This
is useful for building up AST nodes.

# Available Combinators
Unary combinators: `many0`; `many1`; `opt` and `identity`.

Binary combinators: `then`; `or`.

# Adding Your Own
You can add your own combinators as such:

```javascript
const Parser = require('pasukon').Parser
const parser = new Parser(definitions)
parser.addUnaryCombinator('combinatorName', MyCombinatorClass)
parser.addBinaryCombinator('otherName', SomeBinaryCombinator)
```

TODO: Make this easier to do, shouldn't need to know the internals.

Unary combinators take a single argument, a parser, in the constructor. Binary
combinators take an array of two parsers.

They must implement a `parse` method and return a `Result` object. You can see
example combinators in `./lib/parsers/combinators`.

# Writing Efficient Parsers
Each rule is executed from left to right, from top to bottom. If a particular
branch fails, it retries from the beginning on another branch. Eg:

```
demo
  | (many0 :a) then :b
  | (many0 :a) then :c
  ;
```

For the input `aaaac`, the parser will match four `a` tokens, then try `b`.
Because it finds a `c` instead, it goes back all the way, scans four `a` again,
then scans `c` and succeeds.

A more efficient parser would be:

```
demo
  | (many0 :a) then (:b or :c)
  ;
```

Alternatively:

```
demo
  | (many0 :a) then tail
  ;

tail
  | :b
  | :c
  ;
```

Yet another alternative is enabling __caching__. Simply pass `{ cache: true }`
to the options and `(many0 :a)` will be evaluated only once (in the first
example).

Note that memoization uses up more memory, and has the extra step of
saving/checking each parse step. It's up to you whether you want to use it or
not.

Luckly, it's very easy to toggle so once your grammar is done, try
enabling/disabling it and see if you get any performance benefits.

# Development
Remember to `npm install` before anything else. If you make changes to
`./lib/grammar.pasukon`, rebuild the AST with

    npm run grammar

Run tests with

    npm run test

Watch tests with

    npm run watch

To build the browser distribution files, run

    npm run build

To run the benchmark suite, run

    npm run benchmark
