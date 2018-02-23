const path = require('path');

module.exports = {
  entry: './index.web.js',
  output: {
    filename: 'secure-random-password.js',
    path: path.resolve(__dirname, 'dist')
  },
};
