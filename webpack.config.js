module.exports = {
  entry: './public/assets/js/app.js',
  output: {
    path: __dirname + '/public/dist',
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.css$/,
      loaders: [
        'style-loader',
        'css-loader'
      ]
    }]
  }
}