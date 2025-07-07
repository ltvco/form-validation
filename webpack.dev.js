const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

// Check if we're in test mode via environment variable
const isTestMode = process.env.NODE_ENV === 'test';

module.exports = {
  mode: 'development',
  entry: isTestMode ? './src/index.ts' : './dev/index.ts',
  devtool: 'inline-source-map',
  stats: 'minimal',
  devServer: {
    host: '0.0.0.0',
    static: isTestMode ? './dist' : './dev/dist',
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
      template: isTestMode ? './tests/index.html' : './dev/index.html',
      inject: 'body',
    }),
  ],
  optimization: {
    minimize: false,
  },
};
