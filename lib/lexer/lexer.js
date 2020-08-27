const Token = require('./token')

module.exports = class Lexer {
  constructor (definitions) {
    this.definitions = definitions
    this.regexCache = {}
  }

  lex (input) {
    const tokens = []
    while (input !== '') {
      const [result, remaining] = this.lexOne(input)
      if (result !== null) tokens.push(result)
      if (input === remaining) throw new Error(`Invalid token: ${input[0]}`)
      input = remaining
    }

    tokens.push(new Token({ name: 'EOF' }))
    return tokens
  }

  // private

  lexOne (input) {
    for (let i = 0, len = this.definitions.length; i < len; i++) {
      const definition = this.definitions[i]
      const matcher = definition.matcher
      if (matcher.type === 'TOKEN_MATCHER') {
        if (input.startsWith(matcher.match)) {
          return [new Token({ name: definition.name }), input.substring(matcher.match.length)]
        }
      } else if (matcher.type === 'TOKEN_REGEX_MATCHER') {
        const result = this.getRegex(definition).exec(input)
        if (result !== null && result.index === 0) {
          return [new Token({ name: definition.name }), input.substring(result[0].length)]
        }
      }
    }

    return [undefined, input]
  }

  getRegex (definition) {
    const { name } = definition
    if (this.regexCache[name] === undefined) this.regexCache[name] = new RegExp(definition.matcher.regex)
    return this.regexCache[name]
  }
}
