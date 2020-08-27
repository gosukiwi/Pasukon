const Token = require('./token')

module.exports = class Lexer {
  constructor (definitions) {
    this.definitions = definitions
    this.regexCache = {}
    this.position = { col: 1, line: 1 }
  }

  lex (input) {
    const tokens = []
    while (input !== '') {
      const [result, remaining] = this.lexOne(input)
      if (result !== null) tokens.push(result)
      if (input === remaining) throw new Error(`Invalid token: ${input[0]}`)
      input = remaining
    }

    tokens.push(new Token({ name: 'EOF', col: this.position.col, line: this.position.line }))
    return tokens
  }

  // private

  lexOne (input) {
    for (let i = 0, len = this.definitions.length; i < len; i++) {
      const definition = this.definitions[i]
      const matcher = definition.matcher
      if (matcher.type === 'TOKEN_MATCHER') {
        if (input.startsWith(matcher.match)) {
          const token = definition.action === 'match'
            ? new Token({ name: definition.name, col: this.position.col, line: this.position.line })
            : null
          this.updatePosition(matcher.match)
          return [token, input.substring(matcher.match.length)]
        }
      } else if (matcher.type === 'TOKEN_REGEX_MATCHER') {
        const result = this.getRegex(definition).exec(input)
        if (result !== null && result.index === 0) {
          const token = definition.action === 'match'
            ? new Token({ name: definition.name, col: this.position.col, line: this.position.line })
            : null
          this.updatePosition(result[0])
          return [token, input.substring(result[0].length)]
        }
      }
    }

    return [null, input]
  }

  getRegex (definition) {
    const { name } = definition
    if (this.regexCache[name] === undefined) this.regexCache[name] = new RegExp(definition.matcher.regex)
    return this.regexCache[name]
  }

  updatePosition (match) {
    let lineIncrease = 0
    match.split('\n').forEach((line) => {
      this.position.line += lineIncrease
      if (lineIncrease > 0) this.position.col = 1
      this.position.col += line.length
      lineIncrease += 1
    })
  }
}
