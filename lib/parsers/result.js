module.exports = class Result {
  constructor ({ success, remaining }) {
    this.success = success
    this.remaining = remaining
  }

  get failed () {
    return !this.success
  }

  get succeeded () {
    return this.success
  }

  static ok (remaining) {
    return new Result({ success: true, remaining: remaining || [] })
  }

  static fail (remaining) {
    return new Result({ success: false, remaining: remaining || [] })
  }
}
