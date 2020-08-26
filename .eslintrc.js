module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2020: true,
    mocha: true
  },
  plugins: [
    'mocha'
  ],
  extends: [
    'standard',
    'plugin:mocha/recommended'
  ],
  parserOptions: {
    ecmaVersion: 11
  },
  rules: {
  }
}
