let objectIdCounter = 0

module.exports = class TokenList {
  constructor (tokens) {
    this.tokens = tokens
    this._head = tokens[0]
    this._tail = null
    this.objectId = objectIdCounter++
  }

  get length () {
    return this.tokens.length
  }

  peek (name) {
    return this.head.is(name)
  }

  isEmpty () {
    return this.tokens.length === 0
  }

  get head () {
    return this._head
  }

  get tail () {
    if (this._tail === null) this._tail = new TokenList(this.tokens.slice(1))
    return this._tail
  }

  get cacheKey () {
    return this.objectId
  }
}
