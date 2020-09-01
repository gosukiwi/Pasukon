# Pasukon
Pasukon generates parsers using an easy to learn grammar. It's based on [parser
combinators](https://en.wikipedia.org/wiki/Parser_combinator), and also
implements a lexing step.

It is highly extensible (you can make your own lexer and combinators), has no
external dependencies, and works in both Node.js and Browser.

## Try it online!
By far the easiest way to get started is [using Pasukon's online
editor](https://pasukon.rocks/#try-it). Check it out!

# Install

    npm install -g pasukon

# Usage
You can use Pasukon in several ways. The simplest one is to give it a grammar as
a string:

```javascript
const Pasukon = require('pasukon').Pasukon
const parser = new Pasukon(fs.readFileSync('my-grammar.pasukon').toString())
parser.parse('hello, world!')
```

To get the most out of Pasukon, though, consider compiling the grammar to enable
several optimizations. You can compile the grammar using the [online
editor](https://pasukon.rocks/#try-it), or with the CLI:

    pasukon my-grammar.pasukon grammar.js

You can then load it as usual:

```javascript
const grammar = require('grammar')
const Pasukon = require('pasukon').Pasukon
const parser = new Pasukon(grammar)
parser.parse('hello, world!')
```

## Browser Usage
If you are just using a browser, you can use the
[distributable](https://github.com/gosukiwi/Pasukon/tree/master/dist) build:

```html
<script type="text/javascript" src="pasukon.dist.js"></script>
<script type="text/javascript" src="grammar.js"></script>
<script type="text/javascript">
  // `Pasukon` and `grammar` are globals defined in `pasukon.dist.js` and
  // `grammar.js` respectively
  const pasukon = new Pasukon(grammar)
  pasukon.parse('my input')
</script>
```

For anything but trivial usage, it's recommended to use Pasukon from NPM with a
module system. The most popular options at the moment are
[Webpack](https://webpack.js.org/) and [Browserify](http://browserify.org/).

## Options
You can optionally pass `Pasukon` an options object:

* `lexer`: An instance of a Lexer to be used by the parser. Default: `undefined`. If none specified, it will use the built-in lexer in the grammar.
* `cache`: Boolean. Default: `false`. When `true`, it will cache the parsers results.
* `start`: String. Default: `null`. When given, it will start the parsing process from the specified rule.
* `debug`: Boolean. Default: `false`. When `true`, it will use the logger to log each parsing step.
* `logger`: Default: `null`. If specified, it will use this logger when debugging. A logger only needs a `log(string)` method.
* `combinators`: Default: `{}`. If specified, it will include the custom combinators given. For more info, see [Adding Your Own Combinators](#adding-your-own-combinators).
* `context`: Default: `{}`. Sets the evaluation context. For more info, see [Setting The Evaluation Context](#setting-the-evaluation-context).

```javascript
const result = new Pasukon(grammar, { cache: true, start: 'some-rule' }).parse('input')
```

# Syntax
Pasukon syntax is rather simple. It's divided in two parts: Lexing and Parsing.

## Lexing
Optionally, you can define a lexer inside a `lex`-`/lex` block. In the format
`[match|ignore] <token-name> <matcher>`.

```
lex
  match  DEF        'def'
  match  extend     "can also use double quotes"
  match  IDENTIFIER /^[a-zA-Z]/
  match  NEWLINE    {^\n/}
  ignore WHITESPACE /^[ \t\r]+/
/lex
```

It supports two different matchers, the first one is just a string comparison.
The second uses regex, and matches the input against it. It returns true only
if the input starts with the given regex, that is, it has matched and the index
is 0.

For performance reason, it's a good idea to start all regexes with `^` so the
regex engine can stop as soon as possible.

For more complex lexers, you can build your own. All it needs is an object that
implements `*lex(input)` and returns an array of `Token`.

Notice that `*lex` is a generator function that uses `yield` to return tokens in
a lazy way.

The [Token](https://github.com/gosukiwi/Pasukon/blob/master/lib/lexer/token.js)
class lives in `lib/lexer/token`. It implements an `is` method (eg:
`token.is('NEWLINE')`), a `toString` method -- used for error reporting, as well
as `col` and `line` properties. You can use your own `Token` implementation or
the one provided by Pasukon.

> __TODO__: For more info on how to write a custom lexer, see the Wiki.

## Parsing
For an in-depth documentation, check out the Wiki.

The parsing part of the grammar is simply a set or rules:

```
<rule-name>
  | <rule-body>
  | <rule-body>
  ;
```

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
  | many0 ((token a) or (token b))
  | (token a) or ((token b) or (token c))
  ;
```

Notice that no matter how nested it is, an outmost rule is always either in
__unary__, __binary__, or __rule call__ format.

Another important thing to note is the use parentheses. Binary combinators all
have the same precedence, so they are always executed from left to right:

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
is `|`, which is sugar for the `or` combinator:

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

All built-in unary parsers have a _shortcut syntax_. You can use `:` to call the
token parser:

```
program
  | :a
  | :b
  ;
```

The shortcut syntax has high precedence, so it can go anywhere and there's no
need for parentheses:

```
program
  | opt :a // this is a unary call to the `opt` parser
  | opt token a // this is a binary call to the `token` parser, which is not what we want, and is invalid
  ;
```

## Available Combinators

* __many0__: Unary. Take a parser and match it zero or more times.
* __many1__: Unary. Take a parser and match it one or more times.
* __opt__: Unary. Take a parser and match it once. If it fails, report success.
* __then__: Binary. Match the parser on the left. If it succeeds, match the one on the right.
* __or__: Binary. Match the parser on the left. If it fails, try matching the one on the right.

Shortcuts:

* `*` for `many0`
* `+` for `many1`
* `?` for `opt`
* `:` for `token`

Putting it all together:

```
statement
  | :A then ?(:B or :C)
  | +:D
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
  | :A then ?(:B or :C)
  |> 'return { type: 'FOO', first: $1, second: $2 }'
  | :D
  ;
```

Only the outmost call evaluates the code. Binary calls populate two variables:
`$1` and `$2`, while unary and rule calls only populate `$1`.

You can build up complex results from simple ones as such:

```
name
  | many0 (:A or :B) 'return { type: "NAME", value: $1.join("") }'
  ;

statement
  | name then :C 'return { type: "STATEMENT", name: $1, c: $2 }'
  ;
```

### Named Parameters
To make things easier to manage, you can use the special `as` combinator, which
takes a parser on the left hand side, and an arbitrary name on the hand side.
Then it will give you access to a variable of the same name when evaluating
code. You can access it using `$.<my-name>`:

```
statement
  | (*(:A or :B) as :demo) then :C
  |> 'return { type: "STATEMENT", name: $.demo.join(""), c: $2 }'
  ;
```

### Setting The Evaluation Context
You can also set the context in which the code in grammars gets evaluated by
passing a `context` option:

```
const result = new Pasukon('grammar.g', {
  context: {
    foo: function () { return 2 }
  }
}).parse('input')
```

You can then access the context using `$ctx`:

```
name
  | :A 'return $ctx.foo($1)'
  ;
```

The rule above will return `2` if it matches, because `foo` returns `2`. This is
useful for building up nodes in an Abstract Syntax Tree.

Note that this __wont play nice with caching__ though. Because the result of
each parsing step is memoized, the code is executed only once. This might lead
to some unexpected behavior.

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

# Adding Your Own Combinators

```javascript
const Pasukon = require('pasukon').Pasukon
const parser = new Pasukon('...', {
  combinators: {
    binary: { 'my-combinator-name': MyBinaryCombinator },
    unary: { 'another-name': MyUnaryCombinator }
  }
})
```

Unary combinators take a single argument, a parser, in the constructor. Binary
combinators take an array of two parsers.

They must implement a `parse` method and return a `Result` object. This is a
demo binary combinator:

```javascript
class CustomThen extends BinaryCombinator {
  parse (tokens) {
    const lhs = this.parsers[0].parse(tokens)
    if (lhs.failed) return lhs

    const rhs = this.parsers[1].parse(lhs.remaining)
    if (rhs.succeeded) {
      rhs.matched = this.code ? this.eval(lhs.matched, rhs.matched) : [lhs.matched, rhs.matched]
      return rhs
    }

    return this.fail(tokens)
  }
}
```

And this is a custom unary combinator:

```javascript
class CustomMany1 extends UnaryCombinator {
  parse (tokens) {
    if (tokens.isEmpty()) return this.fail(tokens)

    let remaining = tokens
    let matched = []
    while (!remaining.isEmpty()) {
      const result = this.parser.parse(remaining)
      if (result.matched !== null) matched = matched.concat(result.matched)

      if (result.failed) {
        if (matched.length === 0) {
          return this.fail(tokens)
        } else {
          return this.ok(remaining, this.code ? this.eval(matched) : matched)
        }
      }

      remaining = result.remaining
    }
  }
}
```

You can see example combinators in `./lib/parsers/combinators`.

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

# Why
Pasukon is designed to be simple to learn, use and extend. Inspired by the
awesome [PEGjs](https://pegjs.org), I decided to create a similar parser
generator that can handle caching + indent-based grammars by implementing a
lexing step.

Pasukon's grammar syntax is quite simplistic, it provides a few rules and
everything is built upon that. There's no left-recursion elimination or operator
precedence. Instead, you need to define rules in the proper order (like PEG
parsers).
