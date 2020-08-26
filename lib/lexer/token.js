module.exports = class Token {
  constructor ({ name, line, col }) {
    this.name = name
    this.line = line || 0
    this.col = col || 0
  }

  is (name) {
    return this.name === name
  }
}
