module.exports = {
  mode: 'production',
  entry: './index.web.js',
  output: {
    filename: 'secure-random-password.min.js',
  },
  externals: {
    './../../process/browser.js': '{}',
    './../../buffer/index.js': '{}',
  },
};
