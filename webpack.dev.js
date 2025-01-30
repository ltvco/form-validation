const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './dev/index.ts',
  devtool: 'inline-source-map',
  stats: 'minimal',
  devServer: {
    host: '0.0.0.0',
    static: './dev/dist',
    hot: false,
    liveReload: true,
    client: {
      overlay: { warnings: false },
    },
  },
  output: {
    filename: 'index.js',
    library: {
      type: 'umd',
    },
    clean: true,
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts'],
    alias: {
      validation: path.resolve(__dirname, 'src/index.ts'),
      dev: path.resolve(__dirname, 'dev'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './dev/index.html',
      inject: 'body',
    }),
  ],
  optimization: {
    minimize: false,
  },
};
