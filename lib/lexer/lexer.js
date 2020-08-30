const Token = require('./token')

const regexCache = {}

module.exports = class Lexer {
  constructor (definitions) {
    this.definitions = definitions
    this.position = { col: 1, line: 1 }
  }

  * lex (input) {
    while (input !== '') {
      const [token, remaining] = this.lexOne(input)
      if (token !== null) yield token
      if (input === remaining) throw new Error(`Invalid token '${input[0]}' at line ${this.position.line}, column ${this.position.col}`)
      input = remaining
    }

    yield new Token({ name: 'EOF', match: null, col: this.position.col, line: this.position.line })
  }

  // private

  lexOne (input) {
    for (let i = 0, len = this.definitions.length; i < len; i++) {
      const definition = this.definitions[i]
      const matcher = definition.matcher
      if (matcher.type === 'TOKEN_MATCHER') {
        const match = matcher.match
        if (input.substring(0, match.length) === match) {
          const token = definition.action === 'match'
            ? new Token({ name: definition.name, match: match, col: this.position.col, line: this.position.line })
            : null
          this.updatePosition(match)
          return [token, input.substring(match.length)]
        }
      } else if (matcher.type === 'TOKEN_REGEX_MATCHER') {
        const result = this.getRegex(definition).exec(input)
        if (result !== null && result.index === 0) {
          const token = definition.action === 'match'
            ? new Token({ name: definition.name, match: result[0], col: this.position.col, line: this.position.line })
            : null
          this.updatePosition(result[0])
          return [token, input.substring(result[0].length)]
        }
      }
    }

    return [null, input]
  }

  getRegex (definition) {
    const regex = definition.matcher.regex
    return regexCache[regex] || (regexCache[regex] = new RegExp(regex))
  }

  updatePosition (match) {
    for (let i = 0, len = match.length; i < len; i++) {
      if (match[i] === '\n') {
        this.position.line += 1
        this.position.col = 1
      } else {
        this.position.col += 1
      }
    }
  }
}
