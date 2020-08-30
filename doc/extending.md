# Extending Pasukon
Pasukon can be extended with your own lexer as well as combinators.

# Concepts
__Parser__: A function that takes an array of tokens as input and returns a
`Result` object.

__Result__: An object that reports whether the match was successful or not. It
exposes a `remaining` property with the remaining of the given input.

__Combinator__: Takes one or more parsers and returns a new parser, combining
them in some way. For example, `then` takes two parsers and creates a new one,
matching one, and then the other. `many0` takes one parser and matches it zero
or more times.

# TODO
