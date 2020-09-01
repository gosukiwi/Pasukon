module.exports = class Token {
  constructor ({ name, match, line, col }) {
    this.name = name
    this.match = match
    this.line = line || 0
    this.col = col || 0
  }

  is (name) {
    return this.name === name
  }

  toString () {
    return `<TOKEN ${this.name}: '${this.match}'>`
  }
}
