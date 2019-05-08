const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  watch: true,
  entry: ['babel-polyfill', './docs/index.js'],
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.jsx', '.css', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './docs/index.html',
      filename: './index.html',
    }),
  ],
};
