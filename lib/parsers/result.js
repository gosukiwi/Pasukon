const TokenList = require('./token-list')

module.exports = class Result {
  constructor ({ success, remaining, matched }) {
    this.success = success
    this.remaining = remaining || new TokenList([])
    this.matched = matched || null
  }

  get failed () {
    return !this.success
  }

  get succeeded () {
    return this.success
  }

  static ok (remaining, matched) {
    return new Result({ success: true, remaining, matched })
  }

  static fail (remaining) {
    return new Result({ success: false, remaining })
  }
}
